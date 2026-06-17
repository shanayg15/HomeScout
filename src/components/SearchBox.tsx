"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addressToSlug } from "@/lib/utils/id";

/**
 * Address search box. Normalizes the input into a slug and routes to the
 * dossier page, carrying the raw address as a query param.
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

  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0;

  function submit() {
    if (!canSubmit) return;
    const slug = addressToSlug(trimmed) || "property";
    router.push(
      `/property/${slug}?address=${encodeURIComponent(trimmed)}`,
    );
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
          aria-label="Property address"
          placeholder="Paste an address, e.g. 1600 Pennsylvania Ave NW, Washington, DC 20500"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-11 flex-1"
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-11 px-6"
        >
          <Search className="size-4" aria-hidden />
          Search
        </Button>
      </div>
    </form>
  );
}
