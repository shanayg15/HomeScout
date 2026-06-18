import type { Dossier, MoneyRange } from "@/lib/types/dossier";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfidenceChip } from "./ConfidenceChip";
import { SourcedValue } from "./SourcedValue";
import { formatRange, formatNumber, formatPercent } from "@/lib/utils/format";
import type { Sourced } from "@/lib/types/dossier";

/** The "at a glance" rail: value/rent (range + confidence), yield, structure. */
export function QuickFacts({ dossier }: { dossier: Dossier }) {
  const { valuation, structure, deal } = dossier;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick facts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Estimate
          label="Estimated value"
          sourced={valuation.valueEstimate}
        />
        <Estimate label="Estimated rent" sourced={valuation.rentEstimate} />

        <div>
          <p className="text-xs text-muted-foreground">Gross yield</p>
          <p className="mt-0.5 font-semibold">
            <SourcedValue
              sourced={deal.grossYieldPct}
              format={(v) => formatPercent(v)}
              emptyText="-"
            />
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 border-t pt-3">
          <Mini label="Beds" sourced={structure.beds} />
          <Mini label="Baths" sourced={structure.baths} />
          <Mini
            label="Sq ft"
            sourced={structure.squareFootage}
            format={(v) => formatNumber(v)}
          />
          <Mini
            label="Year built"
            sourced={structure.yearBuilt}
            format={(v) => String(v)}
          />
        </dl>
      </CardContent>
    </Card>
  );
}

function Estimate({
  label,
  sourced,
}: {
  label: string;
  sourced: Sourced<MoneyRange>;
}) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <ConfidenceChip confidence={sourced.confidence} />
      </div>
      <p className="font-semibold">
        <SourcedValue<MoneyRange>
          sourced={sourced}
          format={(range) => formatRange(range)}
          emptyText="-"
        />
      </p>
    </div>
  );
}

function Mini({
  label,
  sourced,
  format,
}: {
  label: string;
  sourced: Sourced<number>;
  format?: (v: number) => string;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">
        <SourcedValue sourced={sourced} format={format} emptyText="-" />
      </dd>
    </div>
  );
}
