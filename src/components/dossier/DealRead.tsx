import { Scale } from "lucide-react";
import type { Dossier } from "@/lib/types/dossier";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionSources } from "./SectionSources";
import { ConfidenceChip } from "./ConfidenceChip";
import { SourcedValue } from "./SourcedValue";
import { formatPercent } from "@/lib/utils/format";

/**
 * The "is this a good deal?" area. The plain-English read is an LLM job (M6); the
 * computed gross yield is real now (deterministic). Never an absolute verdict.
 */
export function DealRead({ dossier }: { dossier: Dossier }) {
  const { deal } = dossier;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="size-4" aria-hidden />
          Is this a good deal?
        </CardTitle>
        <CardDescription>
          A grounded read with a range, an explicit confidence level, and the
          exact data points used — never an absolute verdict.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Gross yield (annual rent ÷ value)
            </span>
            <ConfidenceChip confidence={deal.grossYieldPct.confidence} />
          </div>
          <p className="mt-1 text-2xl font-semibold">
            <SourcedValue
              sourced={deal.grossYieldPct}
              format={(v) => formatPercent(v)}
            />
          </p>
          {deal.dataPointsUsed.length > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Based on: {deal.dataPointsUsed.join(", ")}.
            </p>
          ) : null}
        </div>

        <p className="text-muted-foreground">
          The full plain-English deal read is added in a later step (M6).
        </p>
        <p className="text-xs text-muted-foreground">
          Informational only — not financial advice. Gross yield is one signal,
          not a verdict; verify with a licensed professional.
        </p>

        <SectionSources sourced={deal.grossYieldPct} />
      </CardContent>
    </Card>
  );
}
