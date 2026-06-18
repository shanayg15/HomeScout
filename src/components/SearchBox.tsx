"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addressToSlug } from "@/lib/utils/id";
import { isUrl, extractAddressFromListingUrl } from "@/lib/listing/extractAddress";

/**
 * Address (or listing-link) search. If the input is a URL, we extract ONLY the
 * address from the URL string (no page fetch, no listing content) and run the
 * normal dossier; if we can't read an address, we ask the user to paste one.
 */
export function SearchBox({
  initialValue = "",
  className,
}: {
  initialValue?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0;

  function goTo(address: string) {
    const slug = addressToSlug(address) || "property";
    router.push(`/property/${slug}?address=${encodeURIComponent(address)}`);
  }

  function submit() {
    if (!canSubmit) return;
    setError(null);

    if (isUrl(trimmed)) {
      const res = extractAddressFromListingUrl(trimmed);
      if (res.address) {
        goTo(res.address);
      } else {
        setError(res.note ?? "Paste the property address instead.");
      }
      return;
    }

    goTo(trimmed);
  }

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          name="address"
          aria-label="Property address or listing link"
          placeholder="Paste an address or a listing link"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          className="h-11 flex-1"
          autoComplete="off"
        />
        <Button type="submit" disabled={!canSubmit} className="h-11 px-6">
          <Search className="size-4" aria-hidden />
          Search
        </Button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{error}</p>
      ) : null}
    </form>
  );
}
