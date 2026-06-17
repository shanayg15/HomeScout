import type { Dossier } from "@/lib/types/dossier";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";

export function DossierHeader({ dossier }: { dossier: Dossier }) {
  const { identity, generatedAt } = dossier;
  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {identity.propertyType ? (
          <Badge variant="secondary">{identity.propertyType}</Badge>
        ) : null}
        {identity.county ? (
          <span className="text-xs text-muted-foreground">
            {identity.county}
            {identity.apn ? ` · APN ${identity.apn}` : ""}
          </span>
        ) : null}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {identity.formattedAddress}
      </h1>
      <p className="text-sm text-muted-foreground">
        Generated {formatDate(generatedAt)}
      </p>
    </header>
  );
}
