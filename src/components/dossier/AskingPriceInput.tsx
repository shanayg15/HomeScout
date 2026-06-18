"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";

/**
 * Optional user-entered asking price. We never scrape it from a listing — the
 * user provides it. It flows into the deal read (asking-vs-estimate framing) via
 * the URL, clearly labeled as the user's figure (not our estimate).
 */
export function AskingPriceInput({
  slug,
  address,
  current,
}: {
  slug: string;
  address: string;
  current: number | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current != null ? String(current) : "");

  function submit() {
    const n = Number(value.replace(/[^0-9.]/g, ""));
    const params = new URLSearchParams({ address });
    if (Number.isFinite(n) && n > 0) params.set("asking", String(Math.round(n)));
    router.push(`/property/${slug}?${params.toString()}`);
  }

  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <label htmlFor="asking" className="text-xs text-muted-foreground">
        Asking price (optional — you enter this; we never scrape it)
      </label>
      <form
        className="mt-1 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Input
          id="asking"
          inputMode="numeric"
          placeholder="e.g. 475000"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9"
        />
        <Button type="submit" variant="outline" size="sm">
          Compare
        </Button>
        {current != null ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setValue("");
              router.push(`/property/${slug}?address=${encodeURIComponent(address)}`);
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>
      {current != null ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Comparing against your asking price of{" "}
          <span className="font-medium text-foreground">
            {formatCurrency(current)}
          </span>{" "}
          — your figure, not our estimate.
        </p>
      ) : null}
    </div>
  );
}
