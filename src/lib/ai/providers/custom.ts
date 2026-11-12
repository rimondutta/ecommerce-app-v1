import { AIProvider, GenerateOptions } from './types';

export interface CustomProviderConfig {
  apiKey?: string;
  model: string;
  baseUrl: string;
  headers?: string;
  temperature?: number;
  maxTokens?: number;
}

export class CustomProvider implements AIProvider {
  private config: CustomProviderConfig;

  constructor(config: CustomProviderConfig) {
    this.config = config;
  }

  async generate(options: GenerateOptions): Promise<string> {
    const rawBaseUrl = (this.config.baseUrl || '').trim().replace(/\/+$/, '');
    if (!rawBaseUrl) {
      throw new Error('Custom provider Base URL is required');
    }

    const endpoint = rawBaseUrl.endsWith('/chat/completions')
      ? rawBaseUrl
      : `${rawBaseUrl}/chat/completions`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      if (this.config.headers) {
        try {
          const parsedHeaders = JSON.parse(this.config.headers);
          if (typeof parsedHeaders === 'object' && parsedHeaders !== null) {
            Object.assign(headers, parsedHeaders);
          }
        } catch {
          // If headers string is not valid JSON, ignore or warn
        }
      }

      const messages: Array<{ role: string; content: string }> = [];

      if (options.system) {
        messages.push({ role: 'system', content: options.system });
      }

      for (const msg of options.messages) {
        messages.push({ role: msg.role, content: msg.content });
      }

      const bodyPayload: Record<string, unknown> = {
        model: this.config.model || 'gpt-4o-mini',
        messages,
        temperature: options.temperature ?? this.config.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? this.config.maxTokens ?? 1024,
      };

      if (options.jsonMode) {
        bodyPayload.response_format = { type: 'json_object' };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Custom AI provider error (${response.status}): ${errorText.slice(0, 300)}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Custom AI provider returned an empty response');
      }

      return content;
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        throw new Error('Custom AI provider request timed out (15s)');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

