import type { Dossier, MoneyRange } from "@/lib/types/dossier";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionSources } from "@/components/dossier/SectionSources";
import { ConfidenceChip } from "@/components/dossier/ConfidenceChip";
import { SourcedValue } from "@/components/dossier/SourcedValue";
import { formatRange } from "@/lib/utils/format";

export function ValuationCard({ dossier }: { dossier: Dossier }) {
  const { valuation } = dossier;
  const saleCompCount =
    valuation.saleComps.value?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Valuation &amp; rent estimate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Estimate
          label="Estimated value"
          sourced={valuation.valueEstimate}
        />
        <Estimate label="Estimated rent" sourced={valuation.rentEstimate} />

        {saleCompCount > 0 ? (
          <p className="text-xs text-muted-foreground">
            Value based on {saleCompCount} comparable{" "}
            {saleCompCount === 1 ? "property" : "properties"}.
          </p>
        ) : null}

        <SectionSources sourced={valuation.valueEstimate} />
      </CardContent>
    </Card>
  );
}

function Estimate({
  label,
  sourced,
}: {
  label: string;
  sourced: Dossier["valuation"]["valueEstimate"];
}) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <ConfidenceChip confidence={sourced.confidence} />
      </div>
      <p className="text-lg font-semibold">
        <SourcedValue<MoneyRange>
          sourced={sourced}
          format={(range) => formatRange(range)}
        />
      </p>
    </div>
  );
}
