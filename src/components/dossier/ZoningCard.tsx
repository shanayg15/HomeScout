import type { Dossier } from "@/lib/types/dossier";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionSources } from "./SectionSources";
import { SourcedValue } from "./SourcedValue";
import { formatDate } from "@/lib/utils/format";

export function ZoningCard({ dossier }: { dossier: Dossier }) {
  const { zoning } = dossier;
  const permits = zoning.recentPermits;
  const hasPermits =
    permits.availability !== "unavailable" &&
    permits.value !== null &&
    permits.value.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Zoning &amp; permits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Zoning code</p>
            <p className="mt-0.5 font-medium">
              <SourcedValue sourced={zoning.code} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plain-English meaning</p>
            <p className="mt-0.5 text-muted-foreground">
              Plain-English explanation added in a later step (M6).
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1 font-medium">Recent permits</p>
          {hasPermits ? (
            <ul className="space-y-1 text-muted-foreground">
              {permits.value!.map((p) => (
                <li key={`${p.date}-${p.description}`}>
                  {formatDate(p.date)} — {p.description}
                  {p.status ? ` (${p.status})` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No permit data available for this area.
            </p>
          )}
        </div>

        <SectionSources sourced={zoning.code} />
      </CardContent>
    </Card>
  );
}
