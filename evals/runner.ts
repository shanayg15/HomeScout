import { lookupProperty } from "@/lib/services/lookupProperty";
import type { EvalCase, CaseResult, SuiteResult } from "./types";

export async function runCase(c: EvalCase): Promise<CaseResult> {
  try {
    const dossier = await lookupProperty(c.input.address);
    const assertions = c.assertions(dossier, c);
    const mustFailures = assertions.filter(
      (a) => a.tier === "must" && !a.passed && !a.skipped,
    ).length;
    const shouldAll = assertions.filter(
      (a) => a.tier === "should" && !a.skipped,
    );
    const shouldFailures = shouldAll.filter((a) => !a.passed).length;
    return {
      caseId: c.id,
      description: c.description,
      assertions,
      mustFailures,
      shouldFailures,
      shouldTotal: shouldAll.length,
    };
  } catch (err) {
    return {
      caseId: c.id,
      description: c.description,
      assertions: [],
      mustFailures: 1,
      shouldFailures: 0,
      shouldTotal: 0,
      errored: err instanceof Error ? err.stack || err.message : String(err),
    };
  }
}

export async function runSuite(cases: EvalCase[]): Promise<SuiteResult> {
  const results: CaseResult[] = [];
  for (const c of cases) results.push(await runCase(c));
  const totalMustFailures = results.reduce((n, r) => n + r.mustFailures, 0);
  const shouldPassed = results.reduce(
    (n, r) => n + (r.shouldTotal - r.shouldFailures),
    0,
  );
  const shouldTotal = results.reduce((n, r) => n + r.shouldTotal, 0);
  return {
    results,
    totalMustFailures,
    shouldPassRate: shouldTotal ? shouldPassed / shouldTotal : 1,
    ranAt: new Date().toISOString(),
  };
}
