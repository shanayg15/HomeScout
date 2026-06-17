import type { Dossier } from "@/lib/types/dossier";
import { MockBadge } from "@/components/MockBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { DossierHeader } from "@/components/dossier/DossierHeader";
import { OwnershipCard } from "@/components/dossier/OwnershipCard";
import { ValuationCard } from "@/components/dossier/ValuationCard";
import { CompsList } from "@/components/dossier/CompsList";
import { RiskPanel } from "@/components/dossier/RiskPanel";
import { DealRead } from "@/components/dossier/DealRead";

/** Composes a full dossier. UI only — all data already lives on the Dossier. */
export function DossierView({ dossier }: { dossier: Dossier }) {
  return (
    <div className="space-y-6">
      {dossier.isMock ? <MockBadge /> : null}
      <Disclaimer variant="inline" />
      <DossierHeader dossier={dossier} />
      <div className="space-y-6">
        <OwnershipCard dossier={dossier} />
        <ValuationCard dossier={dossier} />
        <CompsList dossier={dossier} />
        <RiskPanel />
        <DealRead />
      </div>
    </div>
  );
}
