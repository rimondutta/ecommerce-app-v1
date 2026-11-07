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
