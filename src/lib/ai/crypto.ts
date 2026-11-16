import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const envKey = process.env.AI_SETTINGS_ENCRYPTION_KEY;
  if (envKey) {
    if (/^[0-9a-fA-F]{64}$/.test(envKey)) {
      return Buffer.from(envKey, 'hex');
    }
    return crypto.createHash('sha256').update(envKey).digest();
  }
  // Fallback to NEXTAUTH_SECRET if custom key not yet set in env
  const fallbackKey = process.env.NEXTAUTH_SECRET || 'toyhourse-secret-ai-encryption-key-default';
  return crypto.createHash('sha256').update(fallbackKey).digest();
}

/**
 * Returns all potential decryption keys to gracefully handle keys
 * encrypted before or after AI_SETTINGS_ENCRYPTION_KEY or NEXTAUTH_SECRET changes.
 */
function getCandidateKeys(): Buffer[] {
  const keys: Buffer[] = [];
  const primary = getKey();
  keys.push(primary);

  const envKey = process.env.AI_SETTINGS_ENCRYPTION_KEY;
  if (envKey) {
    if (/^[0-9a-fA-F]{64}$/.test(envKey)) {
      const hashKey = crypto.createHash('sha256').update(envKey).digest();
      if (!hashKey.equals(primary)) keys.push(hashKey);
    }
  }

  if (process.env.NEXTAUTH_SECRET) {
    const nextAuthKey = crypto.createHash('sha256').update(process.env.NEXTAUTH_SECRET).digest();
    if (!nextAuthKey.equals(primary)) keys.push(nextAuthKey);
  }

  const defaultKey = crypto.createHash('sha256').update('toyhourse-secret-ai-encryption-key-default').digest();
  if (!defaultKey.equals(primary)) keys.push(defaultKey);

  return keys;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: iv:authTag:ciphertext (all hex encoded)
 */
export function encryptApiKey(text: string): string {
  if (!text || !text.trim()) return '';
  try {
    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('[crypto] Encryption error:', error);
    return text;
  }
}

/**
 * Decrypts an AES-256-GCM string.
 * Uses fallback candidate keys so keys encrypted with prior secrets decrypt seamlessly.
 * Gracefully handles unencrypted legacy text if found.
 */
export function decryptApiKey(cipherText?: string): string {
  if (!cipherText || !cipherText.trim()) return '';
  const parts = cipherText.split(':');
  if (parts.length !== 3) {
    // Unencrypted or malformed, return as-is
    return cipherText;
  }

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const candidates = getCandidateKeys();
    for (const key of candidates) {
      try {
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        if (decrypted) return decrypted;
      } catch {
        // Try next candidate key
      }
    }

    return '';
  } catch (error) {
    console.error('[crypto] Decryption error:', error);
    return '';
  }
}

/**
 * Masks an API key for safe display in the admin dashboard:
 * e.g., "AIzaSy...1234" -> "••••••••••••1234"
 */
export function maskApiKey(key?: string): string {
  if (!key || typeof key !== 'string') return '';
  const trimmed = key.trim();
  if (!trimmed) return '';
  if (trimmed.length <= 4) return '••••';
  const last4 = trimmed.slice(-4);
  return `••••••••••••${last4}`;
}

/**
 * Checks if a value sent from client is a masked placeholder
 */
export function isMaskedKey(val?: string): boolean {
  if (!val) return false;
  return val.startsWith('••••');
}

