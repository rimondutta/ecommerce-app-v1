import { AIProvider, GenerateOptions } from './types';

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// Recommended fast & reliable free models on OpenRouter (max 2 fallbacks; OpenRouter limits 'models' array to <= 3 items)
const DEFAULT_FREE_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
const CANDIDATE_FALLBACK_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-chat:free',
];

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = DEFAULT_FREE_MODEL) {
    this.apiKey = apiKey;
    const clean = (model || '').trim();

    // Auto-correct invalid/legacy 'openrouter/free' or deprecated slugs to an active free model
    if (
      !clean ||
      clean === 'openrouter/free' ||
      clean === 'openrouter/auto:free' ||
      clean === 'google/gemini-flash-1.5'
    ) {
      this.model = DEFAULT_FREE_MODEL;
    } else {
      this.model = clean;
    }
  }

  async generate(options: GenerateOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    const timeoutMs = options.timeoutMs ?? 20000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
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

      // Do NOT send response_format for free models because some underlying providers reject it with HTTP 400
      const isPaidJsonCapable =
        options.jsonMode &&
        !this.model.endsWith(':free') &&
        this.model !== 'openrouter/auto';

      // OpenRouter supports passing fallback models via `models: [...]`.
      // NOTE: OpenRouter strictly enforces that the 'models' array must have 3 items or fewer.
      const candidateModels = [
        this.model,
        ...CANDIDATE_FALLBACK_MODELS,
      ]
        .filter((m, i, arr) => arr.indexOf(m) === i)
        .slice(0, 3);

      const bodyPayload: Record<string, unknown> = {
        model: this.model,
        models: candidateModels,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 1200,
        ...(isPaidJsonCapable ? { response_format: { type: 'json_object' } } : {}),
      };

      const doFetch = () =>
        fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://toyhourse.com',
            'X-Title': 'Toy Hourse AI Assistant',
          },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        });

      let response = await doFetch();

      // Retry once on 429 (rate-limited)
      if (response.status === 429) {
        console.warn(`[OpenRouter] "${this.model}" returned 429 (rate-limited). Retrying after 1.5s...`);
        await sleep(1500);
        response = await doFetch();
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

      // Extract from standard content, reasoning fields, or choice text
      let content =
        message?.content ||
        message?.reasoning ||
        message?.reasoning_content ||
        choice?.text ||
        '';

      if (typeof content === 'string') {
        // Strip <think>...</think> if reasoning model outputted internal thoughts
        if (content.includes('</think>')) {
          const parts = content.split('</think>');
          const after = parts[parts.length - 1].trim();
          if (after) {
            content = after;
          }
        }
      }

      if (!content || !String(content).trim()) {
        const snippet = JSON.stringify(choice || data).slice(0, 250);
        throw new Error(`OpenRouter returned an empty response. Choice: ${snippet}`);
      }

      return String(content).trim();
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        throw new Error(`OpenRouter request timed out (${Math.round(timeoutMs / 1000)}s)`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
