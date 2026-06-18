import { describe, it, expect } from "vitest";
import {
  isUrl,
  extractAddressFromListingUrl,
  METADATA_FETCH_ALLOWLIST,
} from "./extractAddress";

describe("isUrl", () => {
  it("distinguishes links from typed addresses", () => {
    expect(isUrl("https://www.zillow.com/homedetails/x")).toBe(true);
    expect(isUrl("redfin.com/TX/San-Antonio/x")).toBe(true);
    expect(isUrl("742 Evergreen Terrace, Springfield, IL 62704")).toBe(false);
    expect(isUrl("123 Main St")).toBe(false);
  });
});

describe("extractAddressFromListingUrl", () => {
  it("never fetches — the metadata allowlist is empty", () => {
    expect(METADATA_FETCH_ALLOWLIST).toHaveLength(0);
  });

  it("extracts a Zillow-style slug (state + zip in one segment)", () => {
    const r = extractAddressFromListingUrl(
      "https://www.zillow.com/homedetails/5500-Grand-Lake-Dr-San-Antonio-TX-78244/12345_zpid/",
    );
    expect(r.method).toBe("url-slug");
    expect(r.address).toBe("5500 Grand Lake Dr San Antonio, TX 78244");
  });

  it("extracts a Redfin-style slug (/ST/City/...-zip/)", () => {
    const r = extractAddressFromListingUrl(
      "https://www.redfin.com/TX/San-Antonio/5500-Grand-Lake-Dr-78244/home/12345",
    );
    expect(r.method).toBe("url-slug");
    expect(r.address).toBe("5500 Grand Lake Dr, San Antonio, TX 78244");
  });

  it("asks for a pasted address when a listing URL has no parseable address", () => {
    const r = extractAddressFromListingUrl("https://www.zillow.com/homes/for_sale/");
    expect(r.address).toBeNull();
    expect(r.method).toBe("user");
    expect(r.note).toMatch(/paste the property address/i);
  });

  it("handles a non-listing URL gracefully", () => {
    const r = extractAddressFromListingUrl("https://example.com/listing/abc");
    expect(r.address).toBeNull();
    expect(r.method).toBe("user");
  });
});
