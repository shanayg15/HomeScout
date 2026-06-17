"use client";

import { useEffect, useRef, useState } from "react";
import type { Comp } from "@/lib/types/dossier";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSelectedComp } from "./SelectedCompContext";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

/**
 * Comps list with sale/rental tabs. Clicking a row highlights its marker on the
 * map (and a map-marker click highlights + scrolls to the row, switching tabs
 * if needed) via the shared SelectedComp context.
 */
export function CompsList({
  saleComps,
  rentalComps,
}: {
  saleComps: Comp[];
  rentalComps: Comp[];
}) {
  const { selectedCompId, setSelectedCompId } = useSelectedComp();
  const [userTab, setUserTab] = useState<"sale" | "rental">(
    saleComps.length > 0 ? "sale" : "rental",
  );

  // The active tab is derived: a selected comp (e.g. from the map) forces its
  // tab; otherwise the user's choice wins. No setState-in-effect needed.
  const selectedKind: "sale" | "rental" | null =
    selectedCompId == null
      ? null
      : saleComps.some((c) => c.id === selectedCompId)
        ? "sale"
        : rentalComps.some((c) => c.id === selectedCompId)
          ? "rental"
          : null;
  const tab = selectedKind ?? userTab;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparable properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setUserTab(v as "sale" | "rental");
            setSelectedCompId(null); // a manual tab switch clears the selection
          }}
        >
          <TabsList>
            <TabsTrigger value="sale">Sale ({saleComps.length})</TabsTrigger>
            <TabsTrigger value="rental">Rental ({rentalComps.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="sale">
            <CompRows
              comps={saleComps}
              priceLabel="Sale price"
              empty="No sale comps available for this area."
              selectedCompId={selectedCompId}
              onSelect={setSelectedCompId}
            />
          </TabsContent>
          <TabsContent value="rental">
            <CompRows
              comps={rentalComps}
              priceLabel="Monthly rent"
              empty="No rental comps available for this area."
              selectedCompId={selectedCompId}
              onSelect={setSelectedCompId}
            />
          </TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground">Comps: RentCast</p>
      </CardContent>
    </Card>
  );
}

function CompRows({
  comps,
  priceLabel,
  empty,
  selectedCompId,
  onSelect,
}: {
  comps: Comp[];
  priceLabel: string;
  empty: string;
  selectedCompId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (comps.length === 0) {
    return <p className="py-3 text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="mt-2 space-y-2">
      {comps.map((c) => (
        <CompRow
          key={c.id}
          comp={c}
          priceLabel={priceLabel}
          selected={selectedCompId === c.id}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function CompRow({
  comp: c,
  priceLabel,
  selected,
  onSelect,
}: {
  comp: Comp;
  priceLabel: string;
  selected: boolean;
  onSelect: (id: string | null) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selected) {
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selected]);

  return (
    <li>
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(selected ? null : c.id)}
        className={cn(
          "w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50",
          selected && "border-primary bg-muted/60 ring-1 ring-primary",
        )}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium">{c.formattedAddress}</span>
          <span className="shrink-0 font-semibold">{formatCurrency(c.price)}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="sr-only">{priceLabel}</span>
          <span>
            {formatNumber(c.beds)} bd / {formatNumber(c.baths)} ba
          </span>
          {c.squareFootage != null ? (
            <span>{formatNumber(c.squareFootage)} sqft</span>
          ) : null}
          {c.distanceMiles != null ? (
            <span>
              {formatNumber(c.distanceMiles, { maximumFractionDigits: 1 })} mi
            </span>
          ) : null}
          {c.similarity != null ? (
            <span>
              {formatPercent(c.similarity, { fromFraction: true, maximumFractionDigits: 0 })}{" "}
              similar
            </span>
          ) : null}
        </div>
      </button>
    </li>
  );
}
