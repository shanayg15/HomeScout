"use client";

import { useEffect, useRef } from "react";
import {
  Map as MlMap,
  Marker,
  Popup,
  NavigationControl,
  LngLatBounds,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Comp, PropertyIdentity } from "@/lib/types/dossier";
import { useSelectedComp } from "./SelectedCompContext";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { MARKER_COLORS } from "./mapColors";

const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

function styleFor(maptilerKey?: string): string | StyleSpecification {
  return maptilerKey
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerKey}`
    : OSM_STYLE;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;",
  );
}

function compPopupHtml(c: Comp): string {
  const priceLabel = c.kind === "sale" ? "Sale price" : "Monthly rent";
  const bb = `${formatNumber(c.beds)} bd / ${formatNumber(c.baths)} ba`;
  const sqft = c.squareFootage != null ? `${formatNumber(c.squareFootage)} sqft` : "";
  const dist = c.distanceMiles != null ? `${formatNumber(c.distanceMiles, { maximumFractionDigits: 1 })} mi away` : "";
  return `<div style="font-size:12px;line-height:1.4">
    <strong>${esc(c.formattedAddress)}</strong>
    <div>${priceLabel}: ${esc(formatCurrency(c.price))}</div>
    <div>${bb}${sqft ? " · " + sqft : ""}</div>
    ${dist ? `<div>${dist}</div>` : ""}
  </div>`;
}

export default function PropertyMapInner({
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const { selectedCompId, setSelectedCompId } = useSelectedComp();

  useEffect(() => {
    if (
      !containerRef.current ||
      identity.latitude == null ||
      identity.longitude == null
    ) {
      return;
    }

    const map = new MlMap({
      container: containerRef.current,
      style: styleFor(maptilerKey),
      center: [identity.longitude, identity.latitude],
      zoom: 13,
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    const coords: [number, number][] = [[identity.longitude, identity.latitude]];

    // Subject marker (distinct color + larger).
    new Marker({ color: MARKER_COLORS.subject, scale: 1.1 })
      .setLngLat([identity.longitude, identity.latitude])
      .setPopup(
        new Popup({ offset: 26 }).setHTML(
          `<div style="font-size:12px"><strong>${esc(identity.formattedAddress)}</strong><div>Subject property</div></div>`,
        ),
      )
      .addTo(map);

    const markers: Record<string, Marker> = {};
    for (const c of [...saleComps, ...rentalComps]) {
      if (c.latitude == null || c.longitude == null) continue;
      const color = c.kind === "sale" ? MARKER_COLORS.sale : MARKER_COLORS.rental;
      const marker = new Marker({ color, scale: 0.8 })
        .setLngLat([c.longitude, c.latitude])
        .setPopup(new Popup({ offset: 20 }).setHTML(compPopupHtml(c)))
        .addTo(map);
      marker.getElement().style.cursor = "pointer";
      marker.getElement().addEventListener("click", () =>
        setSelectedCompId(c.id),
      );
      markers[c.id] = marker;
      coords.push([c.longitude, c.latitude]);
    }
    markersRef.current = markers;

    if (coords.length > 1) {
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new LngLatBounds(coords[0], coords[0]),
      );
      map.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 0 });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [identity, saleComps, rentalComps, maptilerKey, setSelectedCompId]);

  // Sync selection from the list → open that marker's popup + pan to it.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const [id, marker] of Object.entries(markersRef.current)) {
      const popup = marker.getPopup();
      const shouldOpen = id === selectedCompId;
      if (popup && popup.isOpen() !== shouldOpen) marker.togglePopup();
      if (shouldOpen) map.panTo(marker.getLngLat(), { duration: 400 });
    }
  }, [selectedCompId]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Map of the property and comparable properties"
      className="h-[320px] w-full overflow-hidden rounded-xl border sm:h-[420px]"
    />
  );
}
