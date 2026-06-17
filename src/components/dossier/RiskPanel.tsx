import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Placeholder for the risk & neighborhood signals (flood, walkability,
 * demographics, crime). Real implementation arrives in Milestone 5.
 */
export function RiskPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-4" aria-hidden />
          Risk &amp; neighborhood
        </CardTitle>
        <CardDescription>
          Flood zone, walkability, demographics, and area-level crime context —
          added in Milestone 5. Each signal will degrade gracefully to &ldquo;Not
          available&rdquo; where a source has no coverage.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Risk &amp; neighborhood signals — added in Milestone 5.
      </CardContent>
    </Card>
  );
}
