import { TriangleAlert } from "lucide-react";

/**
 * Visible banner for dossier-level warnings (limited coverage, unresolved
 * address, rate limits). The mock-data notice is excluded — the MockBadge
 * already covers that.
 */
export function WarningsBanner({ warnings }: { warnings: string[] }) {
  const shown = warnings.filter((w) => !w.startsWith("This is mock data"));
  if (shown.length === 0) return null;

  return (
    <div
      role="status"
      className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
    >
      <div className="flex items-center gap-2 font-medium">
        <TriangleAlert className="size-4" aria-hidden />
        Heads up about this dossier
      </div>
      <ul className="mt-1 list-disc pl-6">
        {shown.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
    </div>
  );
}
