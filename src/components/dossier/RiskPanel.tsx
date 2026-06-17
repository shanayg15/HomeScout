import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Risk & neighborhood signals. Laid out as the real panel will appear (slots for
 * flood, walkability, demographics, crime) so M5 just fills the slots. Each
 * signal will degrade gracefully to "Not available" where a source has no
 * coverage.
 */
const SLOTS = [
  { label: "Flood zone", hint: "FEMA" },
  { label: "Walkability", hint: "Walk Score" },
  { label: "Demographics", hint: "Census ACS" },
  { label: "Crime context", hint: "FBI / open data" },
];

export function RiskPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-4" aria-hidden />
          Risk &amp; neighborhood
        </CardTitle>
        <CardDescription>
          Flood zone, walkability, demographics, and area-level crime context.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SLOTS.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-dashed p-3"
            >
              <p className="text-xs font-medium">{s.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
              <p className="mt-2 text-xs text-muted-foreground">Added in M5</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
