"use client";

import dynamic from "next/dynamic";
import { MapPinOff } from "lucide-react";
import type { Comp, PropertyIdentity } from "@/lib/types/dossier";
import { Skeleton } from "@/components/ui/skeleton";
import { MARKER_COLORS } from "./mapColors";

// Lazy-load MapLibre so it never ships on the home page / initial render.
const PropertyMapInner = dynamic(() => import("./PropertyMapInner"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-[320px] w-full rounded-xl sm:h-[420px]" />
  ),
});

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block size-2.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {label}
    </span>
  );
}

export function PropertyMap({
  identity,
  saleComps,
  rentalComps,
  maptilerKey,
}: {
  identity: PropertyIdentity;
  saleComps: Comp[];
  rentalComps: Comp[];
  maptilerKey?: string;
}) {
  if (identity.latitude == null || identity.longitude == null) {
    return (
      <div className="flex h-[320px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground sm:h-[420px]">
        <MapPinOff className="size-6" aria-hidden />
        <p className="font-medium text-foreground">Map unavailable</p>
        <p>We couldn&rsquo;t locate this address on the map.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PropertyMapInner
        identity={identity}
        saleComps={saleComps}
        rentalComps={rentalComps}
        maptilerKey={maptilerKey}
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <LegendDot color={MARKER_COLORS.subject} label="Subject" />
        <LegendDot color={MARKER_COLORS.sale} label="Sale comp" />
        <LegendDot color={MARKER_COLORS.rental} label="Rental comp" />
        <span className="ml-auto">
          Comps: RentCast · Map: {maptilerKey ? "MapTiler" : "OpenStreetMap"}
        </span>
      </div>
    </div>
  );
}
