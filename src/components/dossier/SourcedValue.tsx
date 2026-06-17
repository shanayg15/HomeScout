import type { Sourced } from "@/lib/types/dossier";
import { cn } from "@/lib/utils";

/**
 * Render a single `Sourced` value. When unavailable (or null), renders
 * "Not available" plus the note — NEVER a zero, blank, or guessed number.
 */
export function SourcedValue<T>({
  sourced,
  format,
  className,
}: {
  sourced: Sourced<T>;
  format?: (value: T) => string;
  className?: string;
}) {
  if (sourced.availability === "unavailable" || sourced.value === null) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        Not available
        {sourced.note ? (
          <span className="text-xs text-muted-foreground/80">
            {" "}
            — {sourced.note}
          </span>
        ) : null}
      </span>
    );
  }

  const text = format ? format(sourced.value) : String(sourced.value);
  return <span className={className}>{text}</span>;
}
