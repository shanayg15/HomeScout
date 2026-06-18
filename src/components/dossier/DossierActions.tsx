"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  recordRecent,
  isSaved,
  saveProperty,
  removeSaved,
  type StoredProperty,
} from "@/lib/storage/local";

type Props = Omit<StoredProperty, "at">;

/** Records the lookup as "recent", and offers Save + (quota-aware) Refresh. */
export function DossierActions(props: Props) {
  const { slug, address } = props;
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    recordRecent(props);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from localStorage post-mount (SSR-safe)
    setSaved(isSaved(slug));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function toggleSave() {
    if (saved) {
      removeSaved(slug);
      setSaved(false);
    } else {
      saveProperty(props);
      setSaved(true);
    }
  }

  function refresh() {
    const ok = window.confirm(
      "Refresh re-fetches from the data providers and may use API quota. Continue?",
    );
    if (!ok) return;
    router.push(
      `/property/${slug}?address=${encodeURIComponent(address)}&refresh=true`,
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={saved ? "default" : "outline"}
        size="sm"
        onClick={toggleSave}
        aria-pressed={saved}
      >
        {saved ? (
          <BookmarkCheck className="size-4" aria-hidden />
        ) : (
          <Bookmark className="size-4" aria-hidden />
        )}
        {saved ? "Saved" : "Save"}
      </Button>
      <Button variant="outline" size="sm" onClick={refresh}>
        <RotateCw className="size-4" aria-hidden />
        Refresh
      </Button>
    </div>
  );
}
