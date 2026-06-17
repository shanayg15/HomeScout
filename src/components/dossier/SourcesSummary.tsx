import type { Dossier, Sourced } from "@/lib/types/dossier";
import { sourceLabel } from "@/lib/utils/sources";
import { formatDate } from "@/lib/utils/format";

const AVAILABILITY_LABEL: Record<Sourced<unknown>["availability"], string> = {
  available: "Available",
  partial: "Partial",
  unavailable: "Not available",
};

/**
 * Consolidated, expandable list of every data source used, what it provided,
 * and its freshness. A trust feature: a skeptical user can see exactly where
 * each number came from.
 */
export function SourcesSummary({ dossier }: { dossier: Dossier }) {
  const entries: { label: string; sourced: Sourced<unknown> }[] = [
    { label: "Ownership & sale history", sourced: dossier.ownership.lastSalePrice },
    { label: "Structure", sourced: dossier.structure.beds },
    { label: "Tax assessment", sourced: dossier.tax.assessedValue },
    { label: "Value estimate & sale comps", sourced: dossier.valuation.valueEstimate },
    { label: "Rent estimate & rental comps", sourced: dossier.valuation.rentEstimate },
    { label: "Zoning code", sourced: dossier.zoning.code },
    { label: "Recent permits", sourced: dossier.zoning.recentPermits },
    { label: "Flood risk", sourced: dossier.flood.zone },
    { label: "Walkability", sourced: dossier.neighborhood.walkScore },
    { label: "Demographics", sourced: dossier.neighborhood.medianHouseholdIncome },
    { label: "Crime context", sourced: dossier.neighborhood.crimeContext },
    { label: "Gross yield", sourced: dossier.deal.grossYieldPct },
    { label: "Deal read", sourced: dossier.deal.summary },
  ];

  return (
    <details className="rounded-xl border bg-card text-card-foreground">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
        Sources &amp; freshness
      </summary>
      <div className="overflow-x-auto border-t px-4 py-3">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="py-1.5 pr-4 font-medium">What it provided</th>
              <th className="py-1.5 pr-4 font-medium">Source</th>
              <th className="py-1.5 pr-4 font-medium">Status</th>
              <th className="py-1.5 font-medium">As of</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.label} className="border-b last:border-0">
                <td className="py-1.5 pr-4">{e.label}</td>
                <td className="py-1.5 pr-4">{sourceLabel(e.sourced.source)}</td>
                <td className="py-1.5 pr-4 text-muted-foreground">
                  {AVAILABILITY_LABEL[e.sourced.availability]}
                </td>
                <td className="py-1.5 text-muted-foreground">
                  {e.sourced.asOf ? formatDate(e.sourced.asOf) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
