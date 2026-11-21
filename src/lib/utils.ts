import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates whether a given URL belongs to Cloudinary's trusted media domain.
 * Parses the URL hostname to prevent incomplete URL substring vulnerabilities.
 */
export function isCloudinaryUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "res.cloudinary.com" ||
      parsed.hostname.endsWith(".cloudinary.com")
    );
  } catch {
    return false;
  }
}

/**
 * Injects Cloudinary's f_auto and q_auto transformations into a URL so that
 * Cloudinary automatically serves the best format (WebP/AVIF) and compresses
 * the image optimally. Safe to call in both server and client components.
 *
 * - f_auto  → delivers WebP/AVIF to supported browsers (~30-50% savings)
 * - q_auto  → auto-compresses without perceptible quality loss
 * - w_{n}   → optional resize to a target display width
 *
 * @param url   Raw Cloudinary secure_url or any other URL
 * @param opts  { width?: number } — optional pixel width
 */
export function getOptimizedCloudinaryUrl(
  url: string | null | undefined,
  opts: { width?: number } = {}
): string {
  if (!isCloudinaryUrl(url)) return url || "";

  const transforms = ["f_auto", "q_auto"];
  if (opts.width) transforms.push(`w_${opts.width}`);
  const transformStr = transforms.join(",");

  // Skip if already optimised
  if (url.includes("/upload/f_auto")) return url;

  return url.replace("/upload/", `/upload/${transformStr}/`);
}

/**
 * Extracts numeric count (quantity / pieces) from strings like "২ পিস", "2 pcs", "10", "Pack of 3"
 * Handles both Bengali numerals (০-৯) and Western numerals (0-9).
 */
export function extractPiecesCount(str: string): number {
  if (!str) return 1;
  const bengaliToWestern: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  const normalized = str.replace(/[০-৯]/g, (digit) => bengaliToWestern[digit] || digit);
  const match = normalized.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

/**
 * Converts English digits (0-9) to Bengali numerals (০-৯).
 */
export function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bengaliDigits[Number(d)] ?? d);
}

/**
 * Formats pieces variation values into high-converting Bangla action labels,
 * e.g. "2" -> "২ পিস নিতে চাই", "৩ পিস নিতে চাই", etc.
 */
export function formatPcsLabel(val: string): string {
  const trimmed = (val || '').trim();
  if (trimmed.includes('নিতে চাই')) return trimmed;

  const englishDigits = trimmed.replace(/[০-৯]/g, (d) =>
    String(['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'].indexOf(d))
  );
  if (/^\d+$/.test(englishDigits)) {
    const bnNum = toBengaliNumber(englishDigits);
    return `${bnNum} পিস নিতে চাই`;
  }

  if (trimmed.toLowerCase().includes('pc') || trimmed.includes('পিস')) {
    return `${trimmed} নিতে চাই`;
  }

  return trimmed;
}
