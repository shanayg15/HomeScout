/**
 * ToS-safe listing-link handling. We extract ONLY the address, and ONLY from the
 * URL string itself - we never fetch the page, never read listing price /
 * description / photos / agent info, and never store listing content. The
 * metadata-fetch allowlist is intentionally empty (Zillow/Redfin/Realtor.com are
 * NOT on it). Anything beyond URL-slug address extraction is a deliberate,
 * flagged decision - not silently built.
 */

export interface ListingAddressResult {
  address: string | null;
  method: "url-slug" | "user" | "metadata";
  note?: string;
}

/** Domains we would be permitted to fetch open address metadata from. Empty. */
export const METADATA_FETCH_ALLOWLIST: readonly string[] = [];

/** Common listing hosts whose page content we never copy. */
const KNOWN_LISTING_HOSTS = [
  "zillow.com",
  "redfin.com",
  "realtor.com",
  "trulia.com",
  "homes.com",
  "compass.com",
  "movoto.com",
];

const US_STATES =
  "AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC";

/** Looks like a URL rather than a typed address. */
export function isUrl(s: string): boolean {
  const t = s.trim();
  return (
    /^https?:\/\//i.test(t) || /^(?:www\.)?[\w-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(t)
  );
}

/** "5500-Grand-Lake-Dr" → "5500 Grand Lake Dr". */
function spacey(slug: string): string {
  return slug.replace(/[-_+]+/g, " ").trim();
}

/**
 * Extract the property address from a listing URL - URL string only, no fetch.
 * Returns `address: null` (with a friendly note) when we can't, so the UI can
 * ask the user to paste the address instead. Handles two common shapes:
 *  A) `.../5500-Grand-Lake-Dr-San-Antonio-TX-78244/...` (Zillow/Realtor/Trulia)
 *  B) `.../TX/San-Antonio/5500-Grand-Lake-Dr-78244/...` (Redfin)
 */
export function extractAddressFromListingUrl(input: string): ListingAddressResult {
  let url: URL;
  try {
    url = new URL(input.startsWith("http") ? input : `https://${input}`);
  } catch {
    return {
      address: null,
      method: "user",
      note: "That doesn't look like a valid link - paste the property address instead.",
    };
  }

  const segs = decodeURIComponent(url.pathname).split("/").filter(Boolean);

  // A) <number>-<1-8 words>-<ST>-<zip> in a single segment.
  const aRe = new RegExp(
    `^(\\d+(?:[-_][A-Za-z0-9][\\w]*){1,8})[-_](${US_STATES})[-_](\\d{5})`,
    "i",
  );
  for (const seg of segs) {
    const m = seg.match(aRe);
    if (m) {
      return {
        address: `${spacey(m[1])}, ${m[2].toUpperCase()} ${m[3]}`,
        method: "url-slug",
      };
    }
  }

  // B) /<ST>/<City>/<number>-<words>-<zip>/.
  const stateIdx = segs.findIndex((s) =>
    new RegExp(`^(${US_STATES})$`, "i").test(s),
  );
  if (stateIdx !== -1) {
    const st = segs[stateIdx].toUpperCase();
    const city = segs[stateIdx + 1] ? spacey(segs[stateIdx + 1]) : "";
    const bRe = /^(\d+(?:[-_][A-Za-z0-9][\w]*){1,8})[-_](\d{5})$/;
    for (let i = stateIdx + 1; i < segs.length; i++) {
      const m = segs[i].match(bRe);
      if (m) {
        return {
          address: `${spacey(m[1])}, ${city}, ${st} ${m[2]}`,
          method: "url-slug",
        };
      }
    }
  }

  const host = url.hostname.replace(/^www\./, "");
  const isKnownListing = KNOWN_LISTING_HOSTS.some((h) => host.endsWith(h));
  return {
    address: null,
    method: "user",
    note: isKnownListing
      ? "We read the address from your link and pull public data - we don't copy the listing's content. We couldn't find the address in this link, so paste the property address instead."
      : "We couldn't read an address from that link - paste the property address instead.",
  };
}
