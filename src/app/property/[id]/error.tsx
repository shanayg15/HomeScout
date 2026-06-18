"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

/** Friendly hard-error state with a retry — never a stack trace. */
export default function DossierError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto my-12 max-w-xl space-y-4 rounded-xl border p-6 text-center">
      <TriangleAlert className="mx-auto size-8 text-amber-600" aria-hidden />
      <h1 className="text-xl font-semibold">We couldn&rsquo;t generate this dossier</h1>
      <p className="text-sm text-muted-foreground">
        Something went wrong while pulling public data for this address. This is
        usually temporary — please try again.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={() => reset()}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Back home
        </Link>
      </div>
    </div>
  );
}
