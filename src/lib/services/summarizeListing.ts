/**
 * ToS-safe listing-link ingestion: extract only the ADDRESS the user is already
 * looking at, then run the normal public-data dossier. We never scrape listing
 * content (price, photos, description) from Zillow/Redfin/Realtor.com.
 * Stub — real implementation arrives in Milestone 8.
 */
export async function summarizeListing(
  _listingUrl: string,
): Promise<{ address: string | null }> {
  throw new Error(
    "Not implemented — added in Milestone 8 (summarizeListing).",
  );
}
