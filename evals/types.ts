import type { Dossier } from "@/lib/types/dossier";

export type Tier = "must" | "should";

export interface AssertionResult {
  name: string;
  tier: Tier;
  passed: boolean;
  /** Human explanation, especially on failure. */
  detail?: string;
  /** True when pending real data (M3/M5/M6) — not counted as pass or fail. */
  skipped?: boolean;
}

export interface EvalCase {
  /** Unique, e.g. "happy-sf-single-family". */
  id: string;
  description: string;
  input: {
    address: string;
    /** If the user is evaluating a listing price. */
    askingPrice?: number;
  };
  groundTruth?: {
    /** A real, verifiable recent sale (for range checks). */
    knownSalePrice?: number;
    knownSaleDate?: string;
    /** e.g. "AE". */
    knownFloodZone?: string;
    knownInSFHA?: boolean;
    /** e.g. thin coverage => at most "low". */
    expectedConfidenceAtMost?: "high" | "medium" | "low";
    notes?: string;
  };
  /** Assertions receive the produced dossier and return results. */
  assertions: (dossier: Dossier, c: EvalCase) => AssertionResult[];
  /** If true, the case is wired but (some assertions) skipped until real data. */
  pendingRealData?: boolean;
}

export interface CaseResult {
  caseId: string;
  description: string;
  assertions: AssertionResult[];
  mustFailures: number;
  shouldFailures: number;
  shouldTotal: number;
  /** If lookupProperty threw. */
  errored?: string;
}

export interface SuiteResult {
  results: CaseResult[];
  totalMustFailures: number;
  /** 0..1 across all should assertions. */
  shouldPassRate: number;
  ranAt: string;
}
