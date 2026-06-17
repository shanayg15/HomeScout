import { describe, it, expect } from "vitest";
import { getMockDossier } from "@/lib/providers/mock/mockProperty";
import { validateDossier, DossierSchema } from "@/lib/schemas/dossier";

describe("DossierSchema", () => {
  it("validates the mock dossier", () => {
    const mock = getMockDossier("1600 Pennsylvania Ave NW, Washington, DC 20500");
    expect(() => validateDossier(mock)).not.toThrow();
  });

  it("rejects a fabricated value on an unavailable field", () => {
    const mock = getMockDossier("123 Main St, Springfield, IL 62704");
    // zoning.plainEnglish is unavailable in the mock; injecting a value must fail.
    const fabricated = {
      ...mock,
      zoning: {
        ...mock.zoning,
        plainEnglish: {
          ...mock.zoning.plainEnglish,
          value: "Residential — fabricated",
        },
      },
    };
    expect(() => validateDossier(fabricated)).toThrow();
  });

  it("rejects unexpected top-level keys (strict)", () => {
    const mock = getMockDossier("123 Main St, Springfield, IL 62704");
    expect(() =>
      DossierSchema.parse({ ...mock, surprise: true }),
    ).toThrow();
  });
});
