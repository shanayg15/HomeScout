import type { Confidence } from "@/lib/types/dossier";
import { cn } from "@/lib/utils";

const STYLES: Record<Confidence, string> = {
  high: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  medium:
    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  low: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  unknown:
    "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
};

const LABEL: Record<Confidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
  unknown: "Confidence unknown",
};

/**
 * Confidence chip with consistent color semantics. The text label is ALWAYS
 * present — confidence is never conveyed by color alone (accessibility).
 */
export function ConfidenceChip({
  confidence,
  className,
}: {
  confidence: Confidence;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        STYLES[confidence],
        className,
      )}
    >
      {LABEL[confidence]}
    </span>
  );
}
