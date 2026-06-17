import { writeFileSync } from "node:fs";
import type { AssertionResult, SuiteResult } from "./types";

function mark(a: AssertionResult): string {
  if (a.skipped) return "SKIP";
  return a.passed ? "PASS" : "FAIL";
}

function isRangeContains(a: AssertionResult): boolean {
  return a.name.replace(/\s/g, "").toLowerCase().includes("rangecontains");
}

/** Valuation range-hit rate across non-skipped rangeContains assertions. */
function rangeHitRate(suite: SuiteResult): {
  hit: number;
  total: number;
} {
  let hit = 0;
  let total = 0;
  for (const r of suite.results) {
    for (const a of r.assertions) {
      if (isRangeContains(a) && !a.skipped) {
        total += 1;
        if (a.passed) hit += 1;
      }
    }
  }
  return { hit, total };
}

export function printReport(suite: SuiteResult): void {
  const lines: string[] = [];
  lines.push("");
  lines.push("Homescout eval suite");
  lines.push("====================");

  let caseFails = 0;
  for (const r of suite.results) {
    const caseFailed = r.mustFailures > 0 || !!r.errored;
    if (caseFailed) caseFails += 1;
    lines.push("");
    lines.push(`${caseFailed ? "[FAIL]" : "[ ok ]"} ${r.caseId} — ${r.description}`);
    if (r.errored) {
      lines.push(`        ERROR: ${r.errored.split("\n")[0]}`);
    }
    for (const a of r.assertions) {
      const tag = a.tier === "must" ? "MUST  " : "SHOULD";
      const detail = a.detail ? `  (${a.detail})` : "";
      lines.push(`        ${mark(a)} [${tag}] ${a.name}${detail}`);
    }
  }

  const { hit, total } = rangeHitRate(suite);
  lines.push("");
  lines.push("Summary");
  lines.push("-------");
  lines.push(`Cases:                ${suite.results.length}`);
  lines.push(`Cases with failures:  ${caseFails}`);
  lines.push(`MUST failures:        ${suite.totalMustFailures}`);
  lines.push(
    `SHOULD pass-rate:     ${(suite.shouldPassRate * 100).toFixed(0)}%`,
  );
  lines.push(
    `Valuation range-hit:  ${
      total === 0 ? "n/a (0 evaluated — pending real data)" : `${hit}/${total}`
    }`,
  );
  lines.push(`Ran at:               ${suite.ranAt}`);
  lines.push("");
  lines.push(
    suite.totalMustFailures > 0
      ? "RESULT: FAIL — a MUST assertion failed."
      : "RESULT: PASS — all MUST assertions held.",
  );
  lines.push("");

  console.log(lines.join("\n"));
}

export function writeJson(suite: SuiteResult, path: string): void {
  writeFileSync(path, JSON.stringify(suite, null, 2));
  console.log(`Wrote ${path}`);
}
