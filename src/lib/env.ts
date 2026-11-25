/**
 * Strips surrounding whitespace and matching outer quotes from environment variables.
 * Required because `docker run --env-file .env` preserves literal quotes around values.
 */
export function cleanEnv(value?: string | null): string {
  if (!value) return '';
  return value.trim().replace(/^(['"])(.*)\1$/, '$2');
}
