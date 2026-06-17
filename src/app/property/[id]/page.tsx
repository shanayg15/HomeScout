import Link from "next/link";
import { lookupProperty } from "@/lib/services/lookupProperty";
import { DossierView } from "@/components/DossierView";
import { SearchBox } from "@/components/SearchBox";
import { buttonVariants } from "@/components/ui/button";

/**
 * Dossier page. Server component: reads the raw address from the (async, in
 * Next 16) search params, calls the service directly, and renders the dossier.
 * No business logic here — only orchestration of the service + view.
 */
export default async function PropertyPage({
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = sp.address;
  const address = (Array.isArray(raw) ? raw[0] : raw)?.trim();

  if (!address) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Search for a property
        </h1>
        <p className="text-muted-foreground">
          Paste an address to generate its dossier.
        </p>
        <SearchBox className="max-w-2xl" />
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back home
        </Link>
      </div>
    );
  }

  const dossier = await lookupProperty(address);

  return (
    <div className="space-y-6">
      <DossierView dossier={dossier} />
      <div>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          New search
        </Link>
      </div>
    </div>
  );
}
