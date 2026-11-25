import { AIProvider, GenerateOptions } from './types';

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

const DEFAULT_FREE_MODEL = 'openrouter/free';

// Reliable fast free models for in-provider rotation when openrouter/free routes to a rate-limited/empty upstream
const FREE_MODEL_FALLBACK_CHAIN = [
  'baidu/ernie-5.5-flash-preview:free',
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'openrouter/free',
];

const DEPRECATED_SLUGS = new Set([
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-chat:free',
  'openrouter/auto:free',
  'google/gemini-flash-1.5',
]);

/** Extracts a JSON object snippet if a reasoning block happens to contain one. */
function extractJsonFromText(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    return text.slice(start, end + 1);
  }
  return '';
}

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_FREE_MODEL) {
    this.apiKey = apiKey;
    const clean = (model || '').trim();

    // Auto-correct deprecated or unavailable free slugs to an active free model
    if (!clean || DEPRECATED_SLUGS.has(clean)) {
      this.model = DEFAULT_FREE_MODEL;
    } else {
      this.model = clean;
    }
  }

  private async callModel(
    targetModel: string,
    messages: Array<{ role: string; content: string }>,
    options: GenerateOptions,
    attemptTimeoutMs: number
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), attemptTimeoutMs);

    try {
      const isFreeTier = targetModel === 'openrouter/free' || targetModel.endsWith(':free');
      const isPaidJsonCapable =
        Boolean(options.jsonMode) &&
        !targetModel.endsWith(':free') &&
        targetModel !== 'openrouter/auto' &&
        targetModel !== 'openrouter/free';

      // OpenRouter free endpoints now enforce reasoning tokens; allocate enough max_tokens and keep effort low
      const defaultMaxTokens = isFreeTier ? 2400 : 1200;
      const effectiveMaxTokens = Math.max(options.maxTokens ?? defaultMaxTokens, isFreeTier ? 2000 : 400);

      const buildPayload = (includeReasoningEffort: boolean): Record<string, unknown> => ({
        model: targetModel,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: effectiveMaxTokens,
        ...(isFreeTier && includeReasoningEffort ? { reasoning: { effort: 'low' } } : {}),
        ...(isPaidJsonCapable ? { response_format: { type: 'json_object' } } : {}),
      });

      const doFetch = (includeReasoningEffort: boolean) =>
        fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://toyhourse.com',
            'X-Title': 'Toy Hourse AI Assistant',
          },
          body: JSON.stringify(buildPayload(includeReasoningEffort)),
          signal: controller.signal,
        });

      let response = await doFetch(true);

      // Some endpoints reject the optional reasoning parameter with 400 — retry once without it
      if (response.status === 400 && isFreeTier) {
        const errBody = await response.text().catch(() => '');
        if (/reasoning/i.test(errBody)) {
          response = await doFetch(false);
        } else {
          throw new Error(`OpenRouter API error (400): ${errBody.slice(0, 300)}`);
        }
      }

      // Retry once briefly on 429 only for non-free (single-model) configs; free configs rotate fast instead
      if (response.status === 429 && !isFreeTier) {
        console.warn(`[OpenRouter] "${targetModel}" returned 429 (rate-limited). Retrying after 1s...`);
        await sleep(1000);
        response = await doFetch(false);
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`OpenRouter API error (${response.status}): ${errorText.slice(0, 300)}`);
      }

      const data = await response.json();

      if (data.error) {
        const errMsg =
          typeof data.error === 'object' && data.error.message
            ? data.error.message
            : JSON.stringify(data.error);
        throw new Error(`OpenRouter error: ${errMsg.slice(0, 200)}`);
      }

      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error(
          `OpenRouter returned no choices: ${JSON.stringify(data).slice(0, 250)}`
        );
      }

      const choice = data.choices[0];
      const message = choice?.message;

      // Prefer user-facing content; never leak internal reasoning text directly to customers
      let content: string =
        (typeof message?.content === 'string' && message.content.trim() ? message.content : '') ||
        (typeof choice?.text === 'string' && choice.text.trim() ? choice.text : '');

      if (!content && options.jsonMode) {
        const reasoningText = message?.reasoning || message?.reasoning_content || '';
        if (typeof reasoningText === 'string' && reasoningText.includes('"reply"')) {
          content = extractJsonFromText(reasoningText);
        }
      }

      if (typeof content === 'string' && content.includes('</think>')) {
        const parts = content.split('</think>');
        const after = parts[parts.length - 1].trim();
        if (after) {
          content = after;
        }
      }

      if (!content || !String(content).trim()) {
        const snippet = JSON.stringify(choice || data).slice(0, 250);
        throw new Error(`OpenRouter returned an empty response. Choice: ${snippet}`);
      }

      return String(content).trim();
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        throw new Error(`OpenRouter request timed out (${Math.round(attemptTimeoutMs / 1000)}s)`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generate(options: GenerateOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const totalBudgetMs = options.timeoutMs ?? 24000;
    const deadline = Date.now() + totalBudgetMs;

    const messages: Array<{ role: string; content: string }> = [];
    if (options.system) {
      let sysContent = options.system;
      if (options.jsonMode) {
        sysContent +=
          '\n\nCRITICAL: You MUST respond ONLY with a valid JSON object starting with { and ending with }. Do not output markdown code blocks, notes, or any text outside the JSON.';
      }
      messages.push({ role: 'system', content: sysContent });
    }
    for (const msg of options.messages) {
      messages.push({ role: msg.role, content: msg.content });
    }

    const isFreePool = this.model === 'openrouter/free' || this.model.endsWith(':free');
    const candidates = isFreePool
      ? Array.from(new Set([this.model, ...FREE_MODEL_FALLBACK_CHAIN]))
      : [this.model];

    let lastError: Error | null = null;
    for (let i = 0; i < candidates.length; i++) {
      const remaining = deadline - Date.now();
      if (remaining < 1500) break;

      const candidate = candidates[i];
      // Cap each attempt at ~11s when backups remain so one slow free endpoint never burns the whole budget
      const hasMoreCandidates = i < candidates.length - 1;
      const attemptTimeoutMs = hasMoreCandidates ? Math.min(remaining, 11000) : remaining;

      try {
        return await this.callModel(candidate, messages, options, attemptTimeoutMs);
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const msg = lastError.message;
        // Stop immediately on authentication errors (401/403) — rotating models won't fix a bad key
        if (/\(401\)|\(403\)/.test(msg)) {
          throw lastError;
        }
        if (hasMoreCandidates) {
          console.warn(`[OpenRouter] Candidate "${candidate}" failed (${msg.slice(0, 120)}); trying next free model...`);
        }
      }
    }

    throw lastError || new Error('OpenRouter request failed');
  }
}
