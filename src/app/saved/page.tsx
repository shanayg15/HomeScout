"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2, Search } from "lucide-react";
import {
  getSaved,
  removeSaved,
  type StoredProperty,
} from "@/lib/storage/local";
import { formatCurrency } from "@/lib/utils/format";
import { ConfidenceChip } from "@/components/dossier/ConfidenceChip";
import { buttonVariants } from "@/components/ui/button";

export default function SavedPage() {
  const [items, setItems] = useState<StoredProperty[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read localStorage post-mount (SSR-safe)
    setItems(getSaved());
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-medium tracking-tight">
        Saved properties
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
          <Bookmark className="size-7 text-muted-foreground" aria-hidden />
          <p className="font-medium">No saved properties yet</p>
          <p className="text-sm text-muted-foreground">
            Open any dossier and tap <span className="font-medium">Save</span> to
            keep it here. Saved properties stay on this device only.
          </p>
          <Link href="/" className={buttonVariants({ size: "sm" })}>
            <Search className="size-4" aria-hidden />
            Search a property
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <li
              key={p.slug}
              className="rounded-xl border bg-card p-4 text-card-foreground"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/property/${p.slug}?address=${encodeURIComponent(p.address)}`}
                  className="font-medium hover:underline"
                >
                  {p.formattedAddress}
                </Link>
                <button
                  type="button"
                  aria-label="Remove from saved"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    removeSaved(p.slug);
                    setItems(getSaved());
                  }}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  Est. value{" "}
                  <span className="font-medium text-foreground">
                    {p.valuePoint != null ? formatCurrency(p.valuePoint) : "—"}
                  </span>
                </span>
                <ConfidenceChip confidence={p.confidence} withInfo={false} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
