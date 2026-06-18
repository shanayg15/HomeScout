import type { Dossier } from "@/lib/types/dossier";
import { env } from "@/lib/config/env";
import { MockBadge } from "@/components/MockBadge";
import { Disclaimer } from "@/components/Disclaimer";
import { SelectedCompProvider } from "@/components/dossier/SelectedCompContext";
import { DossierHeader } from "@/components/dossier/DossierHeader";
import { DossierActions } from "@/components/dossier/DossierActions";
import { PropertyMap } from "@/components/dossier/PropertyMap";
import { QuickFacts } from "@/components/dossier/QuickFacts";
import { OwnershipCard } from "@/components/dossier/OwnershipCard";
import { ValuationCard } from "@/components/dossier/ValuationCard";
import { CompsList } from "@/components/dossier/CompsList";
import { ZoningCard } from "@/components/dossier/ZoningCard";
import { RiskPanel } from "@/components/dossier/RiskPanel";
import { DealRead } from "@/components/dossier/DealRead";
import { SourcesSummary } from "@/components/dossier/SourcesSummary";
import { WarningsBanner } from "@/components/dossier/WarningsBanner";

/**
 * Composes a full dossier. UI only — all data already lives on the Dossier.
 * The map + comps list share selection state via SelectedCompProvider.
 */
export function DossierView({
  dossier,
  address,
}: {
  dossier: Dossier;
  address: string;
}) {
  const saleComps = dossier.valuation.saleComps.value ?? [];
  const rentalComps = dossier.valuation.rentalComps.value ?? [];

  return (
    <SelectedCompProvider>
      <div className="space-y-6">
        {dossier.isMock ? <MockBadge /> : null}
        <Disclaimer variant="inline" />
        <WarningsBanner warnings={dossier.warnings} />
        <DossierHeader dossier={dossier} />
        <DossierActions
          slug={dossier.id}
          address={address}
          formattedAddress={dossier.identity.formattedAddress}
          valuePoint={dossier.valuation.valueEstimate.value?.point ?? null}
          confidence={dossier.valuation.valueEstimate.confidence}
        />

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <PropertyMap
            identity={dossier.identity}
            saleComps={saleComps}
            rentalComps={rentalComps}
            maptilerKey={env.MAPTILER_API_KEY || undefined}
          />
          <QuickFacts dossier={dossier} />
        </div>

        <OwnershipCard dossier={dossier} />
        <ValuationCard dossier={dossier} />
        <CompsList saleComps={saleComps} rentalComps={rentalComps} />
        <ZoningCard dossier={dossier} />
        <RiskPanel dossier={dossier} />
        <DealRead dossier={dossier} />
        <SourcesSummary dossier={dossier} />
      </div>
    </SelectedCompProvider>
  );
}
