import type { EvalCase } from "../types";
import { noFabricationAnywhere, unavailableWithNote } from "../assertions";

/**
 * Designed to force null fields. Critical, runs now. Asserts that specific
 * fields the provider couldn't fill render as unavailable + null + note, and
 * that nothing anywhere in the dossier was invented.
 */
export const noHallucination: EvalCase[] = [
  {
    id: "nohall-missing-fields",
    description: "Address where several public fields are missing",
    input: { address: "__null__ 9 Obscure Pkwy, Faraway, ND 58000" },
    assertions: (dossier) => [
      noFabricationAnywhere(dossier),
      unavailableWithNote(
        "ownership.ownerName unavailable+note",
        dossier.ownership.ownerName,
      ),
      unavailableWithNote(
        "ownership.lastSalePrice unavailable+note",
        dossier.ownership.lastSalePrice,
      ),
      unavailableWithNote(
        "tax.assessedValue unavailable+note",
        dossier.tax.assessedValue,
      ),
      unavailableWithNote(
        "neighborhood.walkScore unavailable+note",
        dossier.neighborhood.walkScore,
      ),
    ],
  },
  {
    id: "nohall-thin-no-estimate",
    description: "Sparse area must not invent a value estimate",
    input: { address: "__thin__ Lot 3, Backcountry, WY 82000" },
    assertions: (dossier) => [
      noFabricationAnywhere(dossier),
      unavailableWithNote(
        "valuation.valueEstimate unavailable+note",
        dossier.valuation.valueEstimate,
      ),
      unavailableWithNote(
        "valuation.rentEstimate unavailable+note",
        dossier.valuation.rentEstimate,
      ),
    ],
  },
];
