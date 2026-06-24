/**
 * Pexels image lookup — used by the Par-Level Calculator to put a photo on
 * each product line.
 *
 * Env-gated + best-effort: a no-op (returns null) when PEXELS_API_KEY is unset
 * and never throws. Callers fall back to an on-brand category placeholder, so
 * the tool works fully without the key.
 *
 * Server-only — the key must never reach the browser.
 */

import "server-only";

const ENDPOINT = "https://api.pexels.com/v1/search";

export function isPexelsConfigured(): boolean {
  return Boolean(process.env.PEXELS_API_KEY);
}

export type PexelsPhoto = {
  url: string; // a small, ready-to-render image URL
  photographer: string;
  sourceUrl: string; // the Pexels page (for optional attribution)
};

// Small module-level cache so repeated lookups for the same product within a
// warm function instance don't re-hit Pexels.
const cache = new Map<string, PexelsPhoto | null>();

/**
 * Return the best square-ish photo for a product name, or null (unset key,
 * no match, or any error). Results are cached by normalised query.
 */
export async function searchProductPhoto(
  query: string,
): Promise<PexelsPhoto | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;

  const q = query.trim().toLowerCase();
  if (!q) return null;
  if (cache.has(q)) return cache.get(q) ?? null;

  try {
    const url = `${ENDPOINT}?query=${encodeURIComponent(q)}&per_page=1&orientation=square`;
    const res = await fetch(url, {
      headers: { Authorization: key },
      // Pexels images are stable; let the platform cache the API response.
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!res.ok) {
      cache.set(q, null);
      return null;
    }
    const data = (await res.json()) as {
      photos?: {
        src?: { small?: string; medium?: string; tiny?: string };
        photographer?: string;
        url?: string;
      }[];
    };
    const photo = data.photos?.[0];
    const src = photo?.src?.small ?? photo?.src?.medium ?? photo?.src?.tiny;
    if (!src) {
      cache.set(q, null);
      return null;
    }
    const result: PexelsPhoto = {
      url: src,
      photographer: photo?.photographer ?? "Pexels",
      sourceUrl: photo?.url ?? "https://www.pexels.com",
    };
    cache.set(q, result);
    return result;
  } catch {
    cache.set(q, null);
    return null;
  }
}
