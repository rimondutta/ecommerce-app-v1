import { AIProvider, GenerateOptions } from './types';

// Ordered list of models to try — from newest to most broadly available.
// gemini-2.0-flash is the most reliable free-tier model; 2.5-flash may 404 on some API keys.
const GEMINI_FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
];

// Default safe model: gemini-2.0-flash has the broadest availability on free-tier API keys
const GEMINI_DEFAULT_MODEL = 'gemini-2.0-flash';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = GEMINI_DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model || GEMINI_DEFAULT_MODEL;
  }

  async generate(options: GenerateOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured');
    }

    const timeoutMs = options.timeoutMs ?? 25000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const rawContents = options.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
          parts: [{ text: m.content || ' ' }],
        }));

      // Normalize: merge consecutive turns with the same role
      const mergedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      for (const item of rawContents) {
        if (mergedContents.length > 0 && mergedContents[mergedContents.length - 1].role === item.role) {
          mergedContents[mergedContents.length - 1].parts.push(...item.parts);
        } else {
          mergedContents.push({ role: item.role, parts: [...item.parts] });
        }
      }

      // Gemini Strict Requirement 1: First content MUST have role: 'user'
      if (mergedContents.length === 0 || mergedContents[0].role !== 'user') {
        mergedContents.unshift({
          role: 'user',
          parts: [{ text: 'এই পণ্যটি অর্ডার করার জন্য কথা বলছি।' }],
        });
      }

      // Gemini Strict Requirement 2: Last content MUST have role: 'user'
      if (mergedContents[mergedContents.length - 1].role !== 'user') {
        mergedContents.push({
          role: 'user',
          parts: [{ text: 'পরবর্তী নির্দেশনা দিন।' }],
        });
      }

      const contents = mergedContents;

      const bodyPayload: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxTokens ?? 1024,
          ...(options.jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      };

      if (options.system) {
        bodyPayload.systemInstruction = {
          parts: [{ text: options.system }],
        };
      }

      let cleanModel = (this.model || GEMINI_DEFAULT_MODEL).trim().replace(/^models\//, '');

      // Normalize known invalid or deprecated model names → GEMINI_DEFAULT_MODEL
      const INVALID_MODELS = [
        'gemini-1.0-pro',
        'gemini-pro',
        'gemini-3.5-flash',   // non-existent, typo
        'gemini-3.8-flash',   // non-existent, typo
        'gemini-ultra',
      ];
      if (INVALID_MODELS.includes(cleanModel)) {
        console.warn(`[Gemini] Invalid/deprecated model "${cleanModel}", auto-correcting to ${GEMINI_DEFAULT_MODEL}`);
        cleanModel = GEMINI_DEFAULT_MODEL;
      }

      const buildUrl = (m: string) =>
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          m
        )}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

      const doFetch = (model: string) =>
        fetch(buildUrl(model), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        });

      let response = await doFetch(cleanModel);

      // 404 → walk through the full fallback chain until one works
      if (response.status === 404) {
        for (const candidateModel of GEMINI_FALLBACK_MODELS) {
          if (candidateModel === cleanModel) continue;
          console.warn(`[Gemini] Model "${cleanModel}" returned 404, trying "${candidateModel}"...`);
          cleanModel = candidateModel;
          response = await doFetch(cleanModel);
          if (response.ok || response.status !== 404) break;
        }
      }

      // 503 / 429 (overloaded / rate-limited): one backoff retry, then try sibling models
      if (response.status === 503 || response.status === 429) {
        console.warn(`[Gemini] "${cleanModel}" returned ${response.status} (overloaded). Retrying after 1s...`);
        await sleep(1000);
        response = await doFetch(cleanModel);

        // If still overloaded, try sibling flash models
        if (response.status === 503 || response.status === 429) {
          for (const siblingModel of GEMINI_FALLBACK_MODELS) {
            if (siblingModel === cleanModel) continue;
            console.warn(`[Gemini] Still overloaded. Trying sibling model "${siblingModel}"...`);
            response = await doFetch(siblingModel);
            if (response.ok) {
              cleanModel = siblingModel;
              console.info(`[Gemini] Sibling model "${siblingModel}" succeeded.`);
              break;
            }
            await sleep(500);
          }
        }
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');

        // Mark 503/429 so the caller (providers/index.ts) can fall back to OpenRouter
        if (response.status === 503 || response.status === 429) {
          const overloadErr = new Error(`Gemini API overloaded (${response.status}): ${errorText.slice(0, 200)}`);
          (overloadErr as Error & { isOverloaded?: boolean }).isOverloaded = true;
          throw overloadErr;
        }

        if (response.status === 404) {
          try {
            const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(this.apiKey)}`;
            const listRes = await fetch(listUrl, {
              headers: { 'x-goog-api-key': this.apiKey },
              signal: AbortSignal.timeout(6000),
            });
            if (listRes.ok) {
              const listData = await listRes.json();
              const availableModels = (listData.models || [])
                .filter((m: { supportedGenerationMethods?: string[] }) =>
                  m.supportedGenerationMethods?.includes('generateContent')
                )
                .map((m: { name?: string }) => (m.name || '').replace(/^models\//, ''))
                .filter(Boolean)
                .slice(0, 6);

              if (availableModels.length > 0) {
                throw new Error(
                  `"${cleanModel}" মডেলটি পাওয়া যায়নি (404)। আপনার API Key-এর জন্য উপলব্ধ কয়েকটি মডেল: ${availableModels.join(', ')}।`
                );
              }
            }
          } catch (listErr: unknown) {
            if (listErr instanceof Error && listErr.message.includes('উপলব্ধ')) {
              throw listErr;
            }
          }
        }

        throw new Error(`Gemini API error (${response.status}): ${errorText.slice(0, 300)}`);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const rawParts = candidate?.content?.parts || [];
      // Filter out thought/reasoning blocks and join all text parts
      const partText =
        rawParts
          .filter((p: { thought?: boolean; text?: string }) => p.text && !p.thought)
          .map((p: { text?: string }) => p.text)
          .join('')
          .trim() ||
        rawParts
          .filter((p: { text?: string }) => p.text)
          .map((p: { text?: string }) => p.text)
          .join('')
          .trim();

      if (!partText) {
        throw new Error('Gemini API returned an empty response');
      }

      return partText;
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        throw new Error('Gemini API request timed out (25s)। অনুগ্রহ করে OpenRouter প্রোভাইডার ব্যবহার করুন।');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
