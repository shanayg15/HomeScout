import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const INLINE_TEXT =
  "Homescout is informational only - not an appraisal, home inspection, or financial advice. Data may be incomplete or out of date. Verify anything important with a licensed professional.";

const FOOTER_TEXT =
  "Homescout is informational only - not an appraisal, inspection, or financial advice. Verify everything important with a licensed professional.";

/**
 * The "information, not advice" framing - visible, never buried. Two variants:
 * - `inline`: a short Alert shown near the top of every dossier.
 * - `footer`: a small persistent line in the app footer.
 */
export function Disclaimer({
  variant = "inline",
  className,
}: {
  variant?: "inline" | "footer";
  className?: string;
}) {
  if (variant === "footer") {
    return (
      <p
        className={cn(
          "text-xs leading-relaxed text-muted-foreground",
          className,
        )}
      >
        {FOOTER_TEXT}
      </p>
    );
  }

  return (
    <Alert className={className}>
      <Info />
      <AlertTitle>Information, not advice</AlertTitle>
      <AlertDescription>{INLINE_TEXT}</AlertDescription>
    </Alert>
  );
}
