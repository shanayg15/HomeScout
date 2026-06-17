/**
 * Address → stable slug id helpers. The slug is the cache key (M3) and the URL
 * segment for a dossier, so it must be deterministic for the same input.
 */

/**
 * Lowercase, strip punctuation, collapse whitespace/symbols to single hyphens,
 * and trim leading/trailing hyphens. Stable for identical input.
 *
 * @example addressToSlug("1600 Pennsylvania Ave NW, Washington, DC 20500")
 *          // => "1600-pennsylvania-ave-nw-washington-dc-20500"
 */
export function addressToSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
