/**
 * Provider interfaces — the seams between the service layer and concrete data
 * sources. Real implementations (RentCast, Census, FEMA, …) arrive in later
 * milestones; the mock provider implements the same shapes so the service layer
 * never depends on a concrete source.
 */
import type {
  Dossier,
  PropertyIdentity,
  Valuation,
  FloodRisk,
  Neighborhood,
} from "@/lib/types/dossier";

export interface GeocodeResult {
  identity: PropertyIdentity;
  matched: boolean;
}

export interface PropertyProvider {
  /** Returns identity + structure + ownership + tax (the "record"). */
  getPropertyRecord(identity: PropertyIdentity): Promise<Partial<Dossier>>;
}

export interface ValuationProvider {
  getValuation(identity: PropertyIdentity): Promise<Valuation>;
}

export interface GeocodeProvider {
  geocode(rawAddress: string): Promise<GeocodeResult>;
}

export interface RiskProvider {
  getFlood(identity: PropertyIdentity): Promise<FloodRisk>;
  getNeighborhood(identity: PropertyIdentity): Promise<Neighborhood>;
}
