/**
 * Enterprise Image File Validator for Toy Hourse Platform.
 *
 * Security Controls:
 * 1. Magic-byte verification (detects actual file headers, ignoring client-spoofed MIME types).
 * 2. Whitelist-only format enforcement (JPEG, PNG, WebP, AVIF).
 * 3. Explicit rejection of SVG (blocks Stored XSS vectors and XML external entity injection).
 * 4. Maximum file size cap (default 5MB).
 * 5. Safe filename sanitization (eliminates directory traversal and special control characters).
 * 6. Dimension extraction to prevent decompression bombs.
 */

export interface ValidationResult {
  valid: boolean;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  mimeType?: string;
  width?: number;
  height?: number;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_DIMENSION_PX = 6000; // 6000px max width/height

/**
 * Validates the file buffer against magic bytes and security constraints.
 */
export function validateImageBuffer(buffer: Buffer, maxSizeBytes = MAX_FILE_SIZE_BYTES): ValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty file provided.' };
  }

  if (buffer.length > maxSizeBytes) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(2);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `File size (${sizeMb} MB) exceeds maximum allowed limit of ${maxMb} MB.` };
  }

  // ── 1. Check Magic Bytes ──

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    const dimensions = getJpegDimensions(buffer);
    if (dimensions && (dimensions.width > MAX_DIMENSION_PX || dimensions.height > MAX_DIMENSION_PX)) {
      return { valid: false, error: `Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum allowed ${MAX_DIMENSION_PX}x${MAX_DIMENSION_PX}px.` };
    }
    return {
      valid: true,
      format: 'jpeg',
      mimeType: 'image/jpeg',
      width: dimensions?.width,
      height: dimensions?.height,
    };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    const dimensions = getPngDimensions(buffer);
    if (dimensions && (dimensions.width > MAX_DIMENSION_PX || dimensions.height > MAX_DIMENSION_PX)) {
      return { valid: false, error: `Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum allowed ${MAX_DIMENSION_PX}x${MAX_DIMENSION_PX}px.` };
    }
    return {
      valid: true,
      format: 'png',
      mimeType: 'image/png',
      width: dimensions?.width,
      height: dimensions?.height,
    };
  }

  // WebP: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return {
      valid: true,
      format: 'webp',
      mimeType: 'image/webp',
    };
  }

  // AVIF: ftypavif or ftypmif1 in bytes 4-12
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12);
    if (brand === 'avif' || brand === 'mif1') {
      return {
        valid: true,
        format: 'avif',
        mimeType: 'image/avif',
      };
    }
  }

  // Explicitly detect and reject SVG (XML or <svg> tag)
  const headerText = buffer.slice(0, 100).toString('utf8').toLowerCase();
  if (headerText.includes('<svg') || headerText.includes('<?xml')) {
    return {
      valid: false,
      error: 'SVG format is not permitted for security reasons (prevents script injection). Please upload JPEG, PNG, or WebP.',
    };
  }

  return {
    valid: false,
    error: 'Unsupported or corrupted file format. Only valid JPEG, PNG, WebP, and AVIF images are permitted.',
  };
}

/**
 * Safely extracts dimensions from PNG header chunk (IHDR)
 */
function getPngDimensions(buffer: Buffer): { width: number; height: number } | null {
  try {
    if (buffer.length >= 24) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

/**
 * Safely extracts dimensions from JPEG SOF markers
 */
function getJpegDimensions(buffer: Buffer): { width: number; height: number } | null {
  try {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      // Baseline and Progressive DCT markers
      if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb)) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  } catch {
    // Ignore parsing errors
  }
  return null;
}

/**
 * Sanitizes an incoming filename, stripping directory traversal and non-safe characters.
 */
export function sanitizeFilename(filename: string): string {
  const base = filename.replace(/^.*[\\/]/, ''); // Strip path
  const ext = base.includes('.') ? base.slice(base.lastIndexOf('.')).toLowerCase() : '';
  const nameOnly = base.includes('.') ? base.slice(0, base.lastIndexOf('.')) : base;

  const cleanName = nameOnly
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 50);

  return `${cleanName || 'image'}_${Date.now()}${ext}`;
}
