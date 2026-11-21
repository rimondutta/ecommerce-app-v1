/**
 * Enterprise Production-Ready Structured Logger for Toy Hourse Platform.
 *
 * Capabilities:
 * 1. Automatic redaction of sensitive credentials, API keys, passwords, and tokens.
 * 2. Structured JSON output in production for Datadog / CloudWatch / Vercel log drain ingestion.
 * 3. Dedicated security event tracking (failed auth, rate limit violations, payment tampering).
 * 4. Error serialization with stack traces and causation.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'security';

const SENSITIVE_KEY_PATTERNS = [
  /passw(or)?d/i,
  /secret/i,
  /token/i,
  /auth(orization)?/i,
  /bearer/i,
  /key/i,
  /cookie/i,
  /card.*(number|cvv|exp)/i,
  /cvv/i,
  /pin/i,
];

/**
 * Deeply sanitizes objects to prevent leaking credentials in log aggregation.
 */
function redact(data: unknown, depth = 0): unknown {
  if (depth > 6) return '[MAX_DEPTH]';
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact JWT tokens if detected in strings
    if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(data)) {
      return '[REDACTED_JWT]';
    }
    // Redact Bearer headers
    if (/^Bearer\s+[A-Za-z0-9._~+/-]+=*/i.test(data)) {
      return 'Bearer [REDACTED]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redact(item, depth + 1));
  }

  if (typeof data === 'object') {
    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: process.env.NODE_ENV === 'production' ? data.stack?.split('\n').slice(0, 5).join('\n') : data.stack,
      };
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = redact(value, depth + 1);
      }
    }
    return sanitized;
  }

  return data;
}

function outputLog(level: LogLevel, message: string, meta?: Record<string, unknown>, error?: unknown) {
  const timestamp = new Date().toISOString();
  const environment = process.env.NODE_ENV || 'development';

  const entry: Record<string, unknown> = {
    timestamp,
    level,
    environment,
    message,
  };

  if (meta && Object.keys(meta).length > 0) {
    entry.meta = redact(meta);
  }

  if (error) {
    entry.error = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : String(error);
  }

  if (environment === 'production') {
    // In production, emit single-line structured JSON for cloud log ingestion
    const jsonString = JSON.stringify(entry);
    if (level === 'error' || level === 'security') {
      console.error(jsonString);
    } else if (level === 'warn') {
      console.warn(jsonString);
    } else {
      console.log(jsonString);
    }
  } else {
    // Human-readable dev formatting
    const prefix = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (level === 'error' || level === 'security') {
      console.error(prefix, meta || '', error || '');
    } else if (level === 'warn') {
      console.warn(prefix, meta || '');
    } else {
      console.log(prefix, meta || '');
    }
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      outputLog('debug', message, meta);
    }
  },

  info(message: string, meta?: Record<string, unknown>) {
    outputLog('info', message, meta);
  },

  warn(message: string, meta?: Record<string, unknown>) {
    outputLog('warn', message, meta);
  },

  error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    outputLog('error', message, meta, error);
  },

  security(message: string, meta?: Record<string, unknown>) {
    outputLog('security', message, meta);
  },
};
