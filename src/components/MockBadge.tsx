import { FlaskConical } from "lucide-react";

/**
 * Unmissable indicator that a dossier is mock data. Shown whenever
 * `dossier.isMock` is true so a viewer can never mistake mock figures for real
 * property information.
 */
export function MockBadge() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
    >
      <FlaskConical className="size-4" aria-hidden />
      MOCK DATA - for development only. These numbers are not real.
    </div>
  );
}
