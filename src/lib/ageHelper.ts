/**
 * Utilities for Age Range and Variation Filtering
 */

export interface AgeBounds {
  min: number;
  max: number;
}

/**
 * Parses any age string into numeric [min, max] in years.
 * Examples:
 *   "0-1" -> { min: 0, max: 1 }
 *   "1-3" -> { min: 1, max: 3 }
 *   "3-5 years" -> { min: 3, max: 5 }
 *   "3 - 5 yrs" -> { min: 3, max: 5 }
 *   "5-8" -> { min: 5, max: 8 }
 *   "8+" -> { min: 8, max: 99 }
 *   "8+ years" -> { min: 8, max: 99 }
 *   "0-12 months" -> { min: 0, max: 1 }
 *   "6-12 m" -> { min: 0.5, max: 1 }
 *   "5" -> { min: 5, max: 5 }
 */
export function parseAgeBounds(raw: string | null | undefined): AgeBounds | null {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim().toLowerCase();
  if (!s || s === "all") return null;

  // 1. Months matching (e.g. "0-12 months", "6-12 m", "18m", "6-18 months")
  if (s.includes("month") || s.includes("mth") || /\b\d+\s*m\b/.test(s)) {
    const numbers = s.match(/\d+(\.\d+)?/g);
    if (numbers && numbers.length >= 2) {
      const minMonths = parseFloat(numbers[0]);
      const maxMonths = parseFloat(numbers[1]);
      return { min: minMonths / 12, max: maxMonths / 12 };
    }
    if (numbers && numbers.length === 1) {
      const months = parseFloat(numbers[0]);
      return { min: 0, max: months / 12 };
    }
  }

  // 2. Plus matching (e.g. "8+", "8 +", "8+ years", "8 and up", "8 plus")
  const plusMatch = s.match(/(\d+(\.\d+)?)\s*(?:\+|plus|and up)/);
  if (plusMatch) {
    const val = parseFloat(plusMatch[1]);
    return { min: val, max: 99 };
  }

  // 3. Range matching (e.g. "3-5", "3 - 5", "3 to 5", "3-5 years", "3-5 yrs", "3-5y")
  const rangeMatch = s.match(/(\d+(\.\d+)?)\s*(?:-|to|—|–)\s*(\d+(\.\d+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[3]);
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }

  // 4. Single number matching (e.g. "5", "5 years", "5 yrs", "5y")
  const singleMatch = s.match(/(\d+(\.\d+)?)/);
  if (singleMatch) {
    const val = parseFloat(singleMatch[1]);
    return { min: val, max: val };
  }

  return null;
}

/**
 * Checks whether a product's ageRange string matches the user's selected age filter.
 */
export function matchesAgeRange(
  productAge: string | null | undefined,
  filterAge: string | null | undefined
): boolean {
  if (!filterAge || filterAge === "all") return true;
  if (!productAge) return false;

  const pRaw = productAge.trim().toLowerCase();
  const fRaw = filterAge.trim().toLowerCase();

  // Exact or prefix match
  if (pRaw === fRaw || pRaw.startsWith(fRaw) || fRaw.startsWith(pRaw)) {
    return true;
  }

  const pBounds = parseAgeBounds(pRaw);
  const fBounds = parseAgeBounds(fRaw);

  if (!pBounds || !fBounds) {
    // Strip everything except numbers & '+' and compare
    const pDigits = pRaw.replace(/[^\d+]/g, "");
    const fDigits = fRaw.replace(/[^\d+]/g, "");
    return (
      pDigits !== "" &&
      (pDigits === fDigits || pDigits.includes(fDigits) || fDigits.includes(pDigits))
    );
  }

  // If product is a single point (e.g. "5" or "18 months")
  if (pBounds.min === pBounds.max) {
    return pBounds.min >= fBounds.min && pBounds.min <= fBounds.max;
  }

  // If filter is a single point
  if (fBounds.min === fBounds.max) {
    return fBounds.min >= pBounds.min && fBounds.min <= pBounds.max;
  }

  // Two intervals: require positive overlap width so touching endpoints
  // like (1-3 and 3-5, or 5-8 and 8+) do not cross-match incorrectly
  const overlap = Math.min(pBounds.max, fBounds.max) - Math.max(pBounds.min, fBounds.min);
  return overlap > 0;
}

/**
 * Builds a MongoDB filter query for ageRange based on the selected filter.
 */
export function buildMongoAgeFilter(filterAge: string): Record<string, unknown> {
  const clean = filterAge.trim();
  const bounds = parseAgeBounds(clean);
  if (!bounds) {
    const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return { ageRange: { $regex: escaped, $options: "i" } };
  }

  if (bounds.max >= 90) {
    // e.g. "8+" -> match "8+", "8 +", "8-12", "9-12", etc. but NOT "5-8"
    return {
      $or: [
        { ageRange: { $regex: `${bounds.min}\\s*\\+`, $options: "i" } },
        { ageRange: { $regex: `${bounds.min}\\s*-\\s*(?:99|1[0-9]|20)`, $options: "i" } },
        { ageRange: { $regex: `^\\s*(?:[89]|1[0-9])\\s*\\+?`, $options: "i" } },
        { ageRange: clean },
      ],
    };
  }

  if (bounds.min === 0 && bounds.max <= 1) {
    // e.g. "0-1" -> also match infant/months
    return {
      $or: [
        { ageRange: { $regex: `0\\s*(?:-|to)\\s*1`, $options: "i" } },
        { ageRange: { $regex: `(?:month|mth|\\bm\\b)`, $options: "i" } },
        { ageRange: clean },
      ],
    };
  }

  // General range, e.g. 3-5
  return {
    $or: [
      { ageRange: { $regex: `${bounds.min}\\s*(?:-|to)\\s*${bounds.max}`, $options: "i" } },
      { ageRange: { $regex: `^\\s*${bounds.min}\\s*(?:-|to)\\s*${bounds.max}`, $options: "i" } },
      { ageRange: clean },
    ],
  };
}

/**
 * Fallback color hex for common color names (English & Bengali).
 */
export function getColorFallback(name?: string | null): string {
  if (!name) return "#cbd5e1";
  const n = name.trim().toLowerCase();
  const colorMap: Record<string, string> = {
    red: "#EF4444",
    blue: "#3B82F6",
    green: "#10B981",
    yellow: "#FACC15",
    orange: "#F97316",
    purple: "#A855F7",
    pink: "#EC4899",
    black: "#1F2937",
    white: "#FFFFFF",
    gray: "#6B7280",
    grey: "#6B7280",
    brown: "#92400E",
    cyan: "#06B6D4",
    navy: "#1E3A8A",
    teal: "#14B8A6",
    gold: "#EAB308",
    silver: "#9CA3AF",
    // Bengali common color names
    লাল: "#EF4444",
    নীল: "#3B82F6",
    সবুজ: "#10B981",
    হলুদ: "#FACC15",
    কালো: "#1F2937",
    সাদা: "#FFFFFF",
    গোলাপী: "#EC4899",
    কমলা: "#F97316",
    বেগুনি: "#A855F7",
  };
  return colorMap[n] || "#94A3B8";
}

/**
 * Determines whether a hex color is light (requiring dark text / checkmark).
 */
export function isColorLight(hex?: string | null): boolean {
  if (!hex) return false;
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65;
}

export interface VariationFilterOption {
  _id: string;
  value: string;
  slug: string;
  colorHex?: string | null;
}

export interface VariationFilterGroup {
  _id: string;
  name: string;
  slug: string;
  displayType: "swatch" | "button" | "dropdown" | string;
  values: VariationFilterOption[];
}

/**
 * Sorts an array of age range strings in natural numeric order and de-duplicates them.
 * e.g. ["8+", "0-1", "3-5", "1-3", "5-8"] → ["0-1", "1-3", "3-5", "5-8", "8+"]
 */
export function sortAgeRanges(ranges: string[]): string[] {
  const unique = Array.from(
    new Set(
      ranges
        .map((r) => (typeof r === "string" ? r.trim() : ""))
        .filter(Boolean)
    )
  );

  return unique.sort((a, b) => {
    const aBounds = parseAgeBounds(a);
    const bBounds = parseAgeBounds(b);
    if (!aBounds && !bBounds) return a.localeCompare(b);
    if (!aBounds) return 1;
    if (!bBounds) return -1;
    if (aBounds.min !== bBounds.min) return aBounds.min - bBounds.min;
    return aBounds.max - bBounds.max;
  });
}
