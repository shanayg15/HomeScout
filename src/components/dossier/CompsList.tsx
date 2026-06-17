import type { Comp, Dossier } from "@/lib/types/dossier";
import { MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionSources } from "@/components/dossier/SectionSources";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export function CompsList({ dossier }: { dossier: Dossier }) {
  const { valuation } = dossier;
  const sale = valuation.saleComps.value ?? [];
  const rental = valuation.rentalComps.value ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparable properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        {/* Map view of the subject + comps arrives in M4. */}
        <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-3 text-xs text-muted-foreground">
          <MapPin className="size-4" aria-hidden />
          Interactive map of the property and its comps arrives in a later step
          (M4).
        </div>

        <CompSection
          title="Sale comps"
          priceLabel="Sale price"
          comps={sale}
          empty="No sale comps available for this area."
        />
        <CompSection
          title="Rental comps"
          priceLabel="Monthly rent"
          comps={rental}
          empty="No rental comps available for this area."
        />

        <SectionSources sourced={valuation.saleComps} />
      </CardContent>
    </Card>
  );
}

function CompSection({
  title,
  priceLabel,
  comps,
  empty,
}: {
  title: string;
  priceLabel: string;
  comps: Comp[];
  empty: string;
}) {
  return (
    <div>
      <p className="mb-2 font-medium">{title}</p>
      {comps.length === 0 ? (
        <p className="text-muted-foreground">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-1.5 pr-3 font-medium">Address</th>
                <th className="py-1.5 pr-3 font-medium">{priceLabel}</th>
                <th className="py-1.5 pr-3 font-medium">Beds/Baths</th>
                <th className="py-1.5 pr-3 font-medium">Sqft</th>
                <th className="py-1.5 font-medium">Distance</th>
              </tr>
            </thead>
            <tbody>
              {comps.map((c) => (
                <tr key={c.id} className="border-b last:border-0 align-top">
                  <td className="py-1.5 pr-3">{c.formattedAddress}</td>
                  <td className="py-1.5 pr-3">{formatCurrency(c.price)}</td>
                  <td className="py-1.5 pr-3">
                    {formatNumber(c.beds)} / {formatNumber(c.baths)}
                  </td>
                  <td className="py-1.5 pr-3">{formatNumber(c.squareFootage)}</td>
                  <td className="py-1.5">
                    {c.distanceMiles != null
                      ? `${formatNumber(c.distanceMiles, { maximumFractionDigits: 1 })} mi`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
