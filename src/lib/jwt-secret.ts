/**
 * Centralized JWT secret accessor.
 *
 * Ensures that all JWT signing and verification operations across the application
 * use the authoritative environment secret and fail securely if it is missing.
 *
 * NEVER falls back to a hardcoded or development secret in production.
 */

export function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret || secret.trim() === '') {
    throw new Error(
      'FATAL: NEXTAUTH_SECRET is not configured. Authentication operations cannot proceed securely.'
    );
  }

  return secret;
}

export function getJwtSecretBytes(): Uint8Array {
  return new TextEncoder().encode(getJwtSecret());
}

