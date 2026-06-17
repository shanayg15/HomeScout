/**
 * Nominatim / OpenStreetMap geocoder (fallback only). Per the OSMF usage policy
 * we send a descriptive User-Agent, only use it when Census fails (low rate),
 * and the dossier cache prevents repeat queries. Do not bulk-query the public
 * instance.
 */
import { z } from "zod";
import type { GeocodeResult } from "@/lib/providers/types";
import type { PropertyIdentity } from "@/lib/types/dossier";
import { fetchJson } from "@/lib/providers/http";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "Homescout/0.1 (+https://github.com/shanayg15/HomeScout)";

const US_STATE_ABBR: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", "district of columbia": "DC",
  florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL",
  indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI",
  minnesota: "MN", mississippi: "MS", missouri: "MO", montana: "MT",
  nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC",
  "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR",
  pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT",
  vermont: "VT", virginia: "VA", washington: "WA", "west virginia": "WV",
  wisconsin: "WI", wyoming: "WY",
};

const NominatimSchema = z.array(
  z.object({
    lat: z.string().optional(),
    lon: z.string().optional(),
    display_name: z.string().optional(),
    address: z
      .object({
        house_number: z.string().optional(),
        road: z.string().optional(),
        city: z.string().optional(),
        town: z.string().optional(),
        village: z.string().optional(),
        hamlet: z.string().optional(),
        county: z.string().optional(),
        state: z.string().optional(),
        postcode: z.string().optional(),
      })
      .optional(),
  }),
);

function toStateAbbr(state: string | undefined): string {
  if (!state) return "";
  if (state.length === 2) return state.toUpperCase();
  return US_STATE_ABBR[state.toLowerCase()] ?? state;
}

export async function geocodeNominatim(
  rawAddress: string,
): Promise<GeocodeResult | null> {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", rawAddress);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  let json: unknown;
  try {
    json = await fetchJson(url.toString(), {
      timeoutMs: 10_000,
      headers: { "User-Agent": USER_AGENT },
    });
  } catch {
    return null;
  }

  const parsed = NominatimSchema.safeParse(json);
  if (!parsed.success || parsed.data.length === 0) return null;

  const m = parsed.data[0];
  if (!m.lat || !m.lon) return null;

  const a = m.address ?? {};
  const addressLine1 =
    [a.house_number, a.road].filter(Boolean).join(" ") ||
    (m.display_name?.split(",")[0] ?? rawAddress);
  const city = a.city ?? a.town ?? a.village ?? a.hamlet ?? "";

  const identity: PropertyIdentity = {
    formattedAddress: m.display_name ?? rawAddress,
    addressLine1,
    city,
    state: toStateAbbr(a.state),
    zip: a.postcode ?? "",
    county: a.county,
    latitude: Number(m.lat),
    longitude: Number(m.lon),
  };

  return { identity, matched: true };
}
