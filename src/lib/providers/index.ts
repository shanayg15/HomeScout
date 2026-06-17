/**
 * Provider selection. Returns the REAL data providers. The mock path bypasses
 * this entirely (the service calls the monolithic mock dossier directly so the
 * eval sentinels keep working), so `getProviders()` is only used when
 * `USE_MOCKS=false`.
 */
import type {
  GeocodeProvider,
  PropertyProvider,
  ValuationProvider,
} from "./types";
import { geocodeProvider } from "./geo";
import { RentCastProvider } from "./property/rentcast";

export interface Providers {
  geo: GeocodeProvider;
  property: PropertyProvider;
  valuation: ValuationProvider;
}

export function getProviders(): Providers {
  const rentcast = new RentCastProvider();
  return {
    geo: geocodeProvider,
    property: rentcast,
    valuation: rentcast,
  };
}
