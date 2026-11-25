import connectToDatabase from '@/lib/db';
import AiSettings, { IAiSettings } from '@/models/AiSettings';
import { decryptApiKey } from '@/lib/ai/crypto';
import { cleanEnv } from '@/lib/env';
import { AIProvider, GenerateOptions } from './types';
import { GeminiProvider } from './gemini';
import { OpenRouterProvider } from './openrouter';
import { CustomProvider } from './custom';

export * from './types';
export * from './gemini';
export * from './openrouter';
export * from './custom';

export interface ProviderBundle {
  active: AIProvider | null;
  fallback: AIProvider | null;
  activeProviderName: string;
  fallbackProviderName: string;
  settings: IAiSettings | null;
}

/**
 * Resolves an AIProvider instance given provider name and settings
 */
export function buildProvider(
  providerType: 'gemini' | 'openrouter' | 'custom',
  settings: Partial<IAiSettings> | null
): AIProvider | null {
  if (providerType === 'gemini') {
    const dbKey = decryptApiKey(settings?.gemini?.apiKey);
    const apiKey = dbKey || cleanEnv(process.env.GEMINI_API_KEY);
    if (!apiKey) return null;
    return new GeminiProvider(apiKey, settings?.gemini?.model || 'gemini-3-flash-preview');
  }

  if (providerType === 'openrouter') {
    const dbKey = decryptApiKey(settings?.openrouter?.apiKey);
    const apiKey = dbKey || cleanEnv(process.env.OPENROUTER_API_KEY);
    if (!apiKey) return null;
    return new OpenRouterProvider(
      apiKey,
      settings?.openrouter?.model || cleanEnv(process.env.OPENROUTER_MODEL) || 'openrouter/free'
    );
  }

  if (providerType === 'custom') {
    const dbKey = decryptApiKey(settings?.custom?.apiKey);
    const baseUrl = settings?.custom?.baseUrl || '';
    if (!baseUrl) return null;
    return new CustomProvider({
      apiKey: dbKey || '',
      baseUrl,
      model: settings?.custom?.model || 'gpt-4o-mini',
      headers: settings?.custom?.headers,
      temperature: settings?.custom?.temperature,
      maxTokens: settings?.custom?.maxTokens,
    });
  }

  return null;
}

/**
 * Builds an OpenRouter fallback from env variables only (no DB key needed)
 */
function buildEnvOpenRouterFallback(): AIProvider | null {
  const apiKey = cleanEnv(process.env.OPENROUTER_API_KEY);
  if (!apiKey) return null;
  const model = cleanEnv(process.env.OPENROUTER_MODEL) || 'openrouter/free';
  return new OpenRouterProvider(apiKey, model);
}

/**
 * Loads DB settings and builds the active and fallback providers
 */
export async function getAIProviders(): Promise<ProviderBundle> {
  await connectToDatabase();
  const settings = (await AiSettings.findOne({ key: 'global' }).lean()) as IAiSettings | null;

  const activeProviderName = settings?.activeProvider || 'gemini';
  const fallbackProviderName = settings?.fallbackProvider || 'none';

  const active = buildProvider(activeProviderName, settings);

  let fallback: AIProvider | null =
    fallbackProviderName !== 'none' && fallbackProviderName !== activeProviderName
      ? buildProvider(fallbackProviderName as 'gemini' | 'openrouter' | 'custom', settings)
      : null;

  // Effective fallback provider name for logging
  let effectiveFallbackName: string = fallbackProviderName;

  // Auto-fallback: if no DB-configured fallback, cross-fallback between Gemini and OpenRouter
  if (!fallback && activeProviderName !== 'openrouter') {
    fallback = buildEnvOpenRouterFallback();
    if (fallback) {
      effectiveFallbackName = 'openrouter (auto-env)';
      console.info('[AI] Auto-fallback to OpenRouter (env key) enabled.');
    }
  }

  if (!fallback && activeProviderName === 'openrouter') {
    const dbKey = decryptApiKey(settings?.gemini?.apiKey);
    const geminiKey = dbKey || cleanEnv(process.env.GEMINI_API_KEY);
    if (geminiKey) {
      // Use gemini-3-flash-preview as the auto-fallback default
      const autoFallbackModel = settings?.gemini?.model || 'gemini-3-flash-preview';
      fallback = new GeminiProvider(geminiKey, autoFallbackModel);
      effectiveFallbackName = 'gemini (auto-fallback)';
      console.info('[AI] Auto-fallback to Gemini (env/DB key) enabled.');
    }
  }

  return {
    active,
    fallback,
    activeProviderName,
    fallbackProviderName: effectiveFallbackName,
    settings,
  };
}

/**
 * Checks if AI Order Agent is globally enabled and has a valid key configured.
 * Only positive availability or disabled state from a healthy DB read is cached briefly;
 * transient lookup errors fail false without sticking in Redis for 60s.
 */
export async function isOrderAgentAvailable(): Promise<boolean> {
  try {
    const { withCache } = await import('@/lib/cache');
    const cached = await withCache('ai:order-agent:available', 30, async () => {
      const { active, settings } = await getAIProviders();
      if (!settings?.isOrderAgentEnabled) return false;
      return active !== null;
    });
    return cached;
  } catch {
    return false;
  }
}

/**
 * Checks if AI Suggestions are globally enabled and have a valid key configured
 */
export async function isSuggestionsAvailable(): Promise<boolean> {
  try {
    const { active, settings } = await getAIProviders();
    if (!settings?.isSuggestionsEnabled) return false;
    return active !== null;
  } catch {
    return false;
  }
}

/**
 * Generates text using the active provider, seamlessly trying the fallback provider if errors occur.
 * Gemini 503/429 (overloaded) errors also trigger the fallback instead of surfacing to the user.
 */
export async function generateAI(options: GenerateOptions): Promise<string> {
  const { active, fallback, activeProviderName, fallbackProviderName, settings } = await getAIProviders();

  if (!active && !fallback) {
    throw new Error('দুঃখিত, AI সার্ভিস বর্তমানে সক্রিয় নেই। অনুগ্রহ করে পরে চেষ্টা করুন।');
  }

  const effectiveTemperature =
    options.temperature !== undefined ? options.temperature : (settings?.globalTemperature ?? 0.15);

  const effectiveOptions: GenerateOptions = {
    ...options,
    temperature: effectiveTemperature,
  };

  if (active) {
    try {
      return await active.generate(effectiveOptions);
    } catch (activeError) {
      console.warn(`[AI] Active provider (${activeProviderName}) failed:`, activeError);
      if (!fallback) {
        throw new Error('দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
      // Fall through to fallback below
    }
  }

  if (fallback) {
    try {
      console.info(`[AI] Attempting fallback provider (${fallbackProviderName})...`);
      return await fallback.generate(effectiveOptions);
    } catch (fallbackError) {
      console.error(`[AI] Fallback provider (${fallbackProviderName}) failed:`, fallbackError);
      throw new Error('দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  }

  throw new Error('দুঃখিত, একটু সমস্যা হয়েছে। আবার চেষ্টা করুন।');
}
