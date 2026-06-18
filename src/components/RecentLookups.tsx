"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import {
  getRecent,
  clearRecent,
  type StoredProperty,
} from "@/lib/storage/local";
import { formatCurrency } from "@/lib/utils/format";

/** Recent lookups from localStorage, shown on the home page. Clearable. */
export function RecentLookups() {
  const [items, setItems] = useState<StoredProperty[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read localStorage post-mount (SSR-safe)
    setItems(getRecent());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="size-4 text-muted-foreground" aria-hidden />
          Recent lookups
        </h2>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => {
            clearRecent();
            setItems([]);
          }}
        >
          Clear
        </button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/property/${p.slug}?address=${encodeURIComponent(p.address)}`}
              className="flex items-center justify-between gap-2 rounded-lg border bg-card px-3 py-2 text-sm hover:bg-muted"
            >
              <span className="truncate">{p.formattedAddress}</span>
              {p.valuePoint != null ? (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatCurrency(p.valuePoint)}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
