import { ShieldAlert, Waves, Footprints, Users, Scale } from "lucide-react";
import type { Dossier } from "@/lib/types/dossier";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionSources } from "./SectionSources";
import { ConfidenceChip } from "./ConfidenceChip";
import { SourcedValue } from "./SourcedValue";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

/**
 * Risk & neighborhood signals — flood (FEMA), walkability (Walk Score),
 * demographics (Census ACS), and area-level crime context (FBI / open data).
 * All informational, never a verdict; each degrades to "Not available".
 */
export function RiskPanel({ dossier }: { dossier: Dossier }) {
  const { flood, neighborhood } = dossier;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-4" aria-hidden />
          Risk &amp; neighborhood
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        {/* Flood */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 font-medium">
            <Waves className="size-4 text-sky-600" aria-hidden /> Flood
            <ConfidenceChip confidence={flood.zone.confidence} className="ml-auto" />
          </h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <Field label="FEMA flood zone">
              <SourcedValue sourced={flood.zone} />
            </Field>
            <Field label="In a Special Flood Hazard Area?">
              <SourcedValue
                sourced={flood.inSFHA}
                format={(v) => (v ? "Yes" : "No")}
              />
            </Field>
            <Field label="Flood insurance likely required?">
              <SourcedValue
                sourced={flood.insuranceLikelyRequired}
                format={(v) =>
                  v
                    ? "Likely (for a federally-backed mortgage)"
                    : "Not indicated"
                }
              />
            </Field>
            {flood.panelId ? (
              <Field label="FIRM panel">{flood.panelId}</Field>
            ) : null}
          </dl>
          <p className="text-xs text-muted-foreground">
            Informational only — not a certified flood determination (SFHDF),
            which comes from a licensed provider or your lender.
          </p>
          <SectionSources sourced={flood.zone} />
        </section>

        <Divider />

        {/* Walkability */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 font-medium">
            <Footprints className="size-4 text-emerald-600" aria-hidden />{" "}
            Walkability
            <ConfidenceChip
              confidence={neighborhood.walkScore.confidence}
              className="ml-auto"
            />
          </h3>
          <dl className="grid grid-cols-3 gap-3">
            <Field label="Walk Score">
              <SourcedValue sourced={neighborhood.walkScore} emptyText="—" />
            </Field>
            <Field label="Transit Score">
              <SourcedValue sourced={neighborhood.transitScore} emptyText="—" />
            </Field>
            <Field label="Bike Score">
              <SourcedValue sourced={neighborhood.bikeScore} emptyText="—" />
            </Field>
          </dl>
          <p className="text-xs text-muted-foreground">
            Walkability data from{" "}
            <a
              href="https://www.walkscore.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Walk Score®
            </a>
            .
          </p>
          <SectionSources sourced={neighborhood.walkScore} />
        </section>

        <Divider />

        {/* Demographics */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 font-medium">
            <Users className="size-4 text-violet-600" aria-hidden /> Neighborhood
            <ConfidenceChip
              confidence={neighborhood.medianHouseholdIncome.confidence}
              className="ml-auto"
            />
          </h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <Field label="Median household income">
              <SourcedValue
                sourced={neighborhood.medianHouseholdIncome}
                format={(v) => formatCurrency(v)}
              />
            </Field>
            <Field label="Owner-occupied homes">
              <SourcedValue
                sourced={neighborhood.ownerOccupiedRate}
                format={(v) =>
                  formatPercent(v, { fromFraction: true, maximumFractionDigits: 0 })
                }
              />
            </Field>
          </dl>
          <SectionSources sourced={neighborhood.medianHouseholdIncome} />
        </section>

        <Divider />

        {/* Crime context */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 font-medium">
            <Scale className="size-4 text-amber-600" aria-hidden /> Area crime
            context
          </h3>
          <p>
            <SourcedValue sourced={neighborhood.crimeContext} />
          </p>
          <p className="text-xs text-muted-foreground">
            Area-level context for the surrounding city/county only — not a
            statement about this specific property or block, and not a
            safety rating.
          </p>
          <SectionSources sourced={neighborhood.crimeContext} />
        </section>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

function Divider() {
  return <div className="border-t" />;
}
