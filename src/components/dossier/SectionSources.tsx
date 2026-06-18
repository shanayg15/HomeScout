import type { Sourced } from "@/lib/types/dossier";
import { sourceLabel } from "@/lib/utils/sources";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const AVAILABILITY_LABEL: Record<Sourced<unknown>["availability"], string> = {
  available: "Available",
  partial: "Partial",
  unavailable: "Unavailable",
};

/**
 * Compact per-card provenance footer: "Source · Confidence · As of". Pass the
 * section's representative `Sourced` field. A consolidated, all-sources summary
 * for the whole dossier is added in M4.
 */
export function SectionSources({
  sourced,
  className,
}: {
  sourced: Sourced<unknown>;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs text-muted-foreground",
        className,
      )}
    >
      Source: {sourceLabel(sourced.source)} · Confidence: {sourced.confidence} ·{" "}
      {AVAILABILITY_LABEL[sourced.availability]} · As of:{" "}
      {sourced.asOf ? formatDate(sourced.asOf) : "-"}
    </p>
  );
}
