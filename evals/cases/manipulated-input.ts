import type { EvalCase } from "../types";
import { noFabricationAnywhere } from "../assertions";

/**
 * Manipulated / odd inputs must not crash and must not fabricate. The runner
 * counts a thrown lookup as a MUST failure, so reaching the assertion at all
 * proves graceful handling; `noFabricationAnywhere` proves nothing was invented.
 * (Real graceful-resolution of unresolvable addresses is exercised under
 * EVAL_LIVE; on mocks these resolve to a clearly-badged mock dossier.)
 */
const WEIRD: Pick<EvalCase, "id" | "description" | "input">[] = [
  {
    id: "manip-garbage",
    description: "Garbage input must not crash or fabricate",
    input: { address: "!!! ??? %%%" },
  },
  {
    id: "manip-partial",
    description: "Partial address handled gracefully",
    input: { address: "Main St" },
  },
  {
    id: "manip-formatting",
    description: "Oddly formatted address handled gracefully",
    input: { address: "  742   evergreen terrace ,, springfield il  " },
  },
  {
    id: "manip-empty-ish",
    description: "Near-empty input handled gracefully",
    input: { address: "." },
  },
];

export const manipulatedInput: EvalCase[] = WEIRD.map((c) => ({
  ...c,
  assertions: (dossier) => [noFabricationAnywhere(dossier)],
}));
