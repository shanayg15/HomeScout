import {
  extractAddressFromListingUrl,
  type ListingAddressResult,
} from "@/lib/listing/extractAddress";

/**
 * ToS-safe listing-link ingestion: extract ONLY the address from the listing URL
 * (URL string only - no page fetch, no listing content), then the caller runs
 * the normal public-data dossier. We never scrape listing price/photos/etc.
 */
export async function summarizeListing(
  listingUrl: string,
): Promise<ListingAddressResult> {
  return extractAddressFromListingUrl(listingUrl);
}
