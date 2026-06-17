import { runSuite } from "./runner";
import { allCases } from "./cases";
import { printReport, writeJson } from "./report";

const json = process.argv.includes("--json");

runSuite(allCases).then((suite) => {
  printReport(suite);
  if (json) writeJson(suite, "evals/last-run.json");
  // Hard-fail when any MUST assertion fails.
  process.exit(suite.totalMustFailures > 0 ? 1 : 0);
});
