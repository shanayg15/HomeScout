import type { EvalCase } from "../types";
import { happyPath } from "./happy-path";
import { thinCoverage } from "./thin-coverage";
import { regionalExtremes } from "./regional-extremes";
import { zoning } from "./zoning";
import { floodRisk } from "./flood-risk";
import { noHallucination } from "./no-hallucination";
import { manipulatedInput } from "./manipulated-input";

export const allCases: EvalCase[] = [
  ...happyPath,
  ...thinCoverage,
  ...regionalExtremes,
  ...zoning,
  ...floodRisk,
  ...noHallucination,
  ...manipulatedInput,
];
