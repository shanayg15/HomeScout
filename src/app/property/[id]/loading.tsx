import { Skeleton } from "@/components/ui/skeleton";

/** Shown while the dossier is being assembled (multiple providers can be slow). */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Skeleton className="h-9 w-2/3" />
      <Skeleton className="h-4 w-40" />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-[320px] w-full rounded-xl sm:h-[420px]" />
        <Skeleton className="h-[320px] w-full rounded-xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
