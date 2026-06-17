import type { Dossier } from "@/lib/types/dossier";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionSources } from "@/components/dossier/SectionSources";
import { SourcedValue } from "@/components/dossier/SourcedValue";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export function OwnershipCard({ dossier }: { dossier: Dossier }) {
  const { ownership, structure } = dossier;
  const priorSales = ownership.priorSales;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ownership &amp; sales history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <Field label="Owner of record">
            <SourcedValue sourced={ownership.ownerName} />
          </Field>
          <Field label="Last sale price">
            <SourcedValue
              sourced={ownership.lastSalePrice}
              format={(v) => formatCurrency(v)}
            />
          </Field>
          <Field label="Last sale date">
            <SourcedValue
              sourced={ownership.lastSaleDate}
              format={(v) => formatDate(v)}
            />
          </Field>
          <Field label="Year built">
            <SourcedValue sourced={structure.yearBuilt} />
          </Field>
        </dl>

        <div>
          <p className="mb-1 font-medium">Prior sales</p>
          {priorSales.availability !== "unavailable" &&
          priorSales.value &&
          priorSales.value.length > 0 ? (
            <ul className="space-y-1 text-muted-foreground">
              {priorSales.value.map((sale) => (
                <li key={`${sale.date}-${sale.price}`}>
                  {formatDate(sale.date)} — {formatCurrency(sale.price)}
                </li>
              ))}
            </ul>
          ) : (
            <SourcedValue sourced={priorSales} format={() => ""} />
          )}
        </div>

        <SectionSources sourced={ownership.lastSalePrice} />
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
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
