import type { DataSource } from "@/lib/types/dossier";

/** Human-readable label for each data source, for UI attribution. */
export const SOURCE_LABEL: Record<DataSource, string> = {
  rentcast: "RentCast",
  census: "US Census",
  fema: "FEMA",
  walkscore: "Walk Score",
  fbi_crime: "FBI Crime Data",
  openstreetmap: "OpenStreetMap",
  llm: "AI explanation",
  computed: "Computed",
  mock: "Mock data",
};

export function sourceLabel(source: DataSource): string {
  return SOURCE_LABEL[source];
}
