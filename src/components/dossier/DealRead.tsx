import { Scale } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Placeholder for the grounded "is this a good deal?" read. Real implementation
 * arrives in Milestone 6 (deterministic yield math + an LLM plain-English read
 * with explicit confidence and the exact data points used — never a verdict).
 * M4 surfaces the computed gross yield here.
 */
export function DealRead() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="size-4" aria-hidden />
          Is this a good deal?
        </CardTitle>
        <CardDescription>
          A grounded, plain-English read with a range, an explicit confidence
          level, and the exact data points used — never an absolute verdict.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Deal analysis — added in Milestone 6.
      </CardContent>
    </Card>
  );
}
