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
import { AskingPriceInput } from "./AskingPriceInput";
import { formatPercent, formatCurrency, formatRange } from "@/lib/utils/format";

/**
 * The "is this a good deal?" read. Deterministic gross yield + an LLM
 * plain-English summary grounded only in real dossier numbers, guardrailed
 * against absolute verdicts. Leads with confidence when data is thin.
 */
export function DealRead({
  dossier,
  address,
  askingPrice,
}: {
  dossier: Dossier;
  address: string;
  askingPrice: number | null;
}) {
  const { deal } = dossier;
  const lowConfidence = deal.confidence === "low";

  // Deterministic asking-vs-estimate framing — shown whenever an asking price is
  // entered, regardless of whether the LLM narrative is available.
  const value = dossier.valuation.valueEstimate.value;
  const askingVs =
    askingPrice != null && value?.point != null
      ? {
          within:
            value.low != null &&
            value.high != null &&
            askingPrice >= value.low &&
            askingPrice <= value.high,
          pct: Math.round(((askingPrice - value.point) / value.point) * 1000) / 10,
        }
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="size-4" aria-hidden />
          Is this a good deal?
        </CardTitle>
        <CardDescription>
          A grounded read with a confidence level and the exact data points used
          — never an absolute verdict.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <ConfidenceChip confidence={deal.confidence} />
          {deal.confidenceReason ? (
            <span className="text-xs text-muted-foreground">
              {lowConfidence ? "Limited data — " : ""}
              {deal.confidenceReason}
            </span>
          ) : null}
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <span className="text-xs text-muted-foreground">
            Gross yield (annual rent ÷ value)
          </span>
          <p className="mt-1 text-2xl font-semibold">
            <SourcedValue
              sourced={deal.grossYieldPct}
              format={(v) => formatPercent(v)}
            />
          </p>
        </div>

        {askingVs ? (
          <div className="rounded-lg border bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground">
              Asking vs estimate
            </span>
            <p className="mt-1 font-medium">
              Your asking of {formatCurrency(askingPrice)} is{" "}
              {askingVs.within
                ? "within"
                : askingVs.pct > 0
                  ? `about ${Math.abs(askingVs.pct)}% above`
                  : `about ${Math.abs(askingVs.pct)}% below`}{" "}
              the estimated value range {formatRange(value)}.
            </p>
          </div>
        ) : null}

        <p className="leading-relaxed">
          <SourcedValue sourced={deal.summary} className="text-foreground" />
        </p>

        <AskingPriceInput
          slug={dossier.id}
          address={address}
          current={askingPrice}
        />

        {deal.dataPointsUsed.length > 0 ? (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">
              What this is based on
            </summary>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {deal.dataPointsUsed.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </details>
        ) : null}

        <p className="text-xs text-muted-foreground">
          Informational only — not appraisal or financial advice. This is one
          signal, not a verdict; verify with a licensed professional.
        </p>

        <SectionSources sourced={deal.summary} />
      </CardContent>
    </Card>
  );
}
