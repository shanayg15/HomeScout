import type { Sourced } from "@/lib/types/dossier";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "./InfoTooltip";

/**
 * Render a single `Sourced` value. When unavailable (or null), renders
 * "Not available" with the note in a tooltip - NEVER a zero, blank, or guess.
 */
export function SourcedValue<T>({
  sourced,
  format,
  className,
  emptyText = "Not available",
}: {
  sourced: Sourced<T>;
  format?: (value: T) => string;
  className?: string;
  /** Text shown when unavailable (e.g. "-" for compact rails). */
  emptyText?: string;
}) {
  if (sourced.availability === "unavailable" || sourced.value === null) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-muted-foreground", className)}>
        {emptyText}
        <InfoTooltip
          text={sourced.note ?? "Not available"}
          label="Why this is unavailable"
        />
      </span>
    );
  }

  const text = format ? format(sourced.value) : String(sourced.value);
  return <span className={className}>{text}</span>;
}
