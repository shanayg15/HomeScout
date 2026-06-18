/**
 * Local-first storage for recent + saved lookups (browser localStorage).
 *
 * We keep these client-side on purpose: no auth, and a user's search history is
 * private data we don't need on the server (the privacy guardrail). All
 * functions are safe to call during SSR — they no-op / return [] without a
 * window.
 */
import type { Confidence } from "@/lib/types/dossier";

export interface StoredProperty {
  slug: string;
  /** Raw address, for reconstructing the dossier URL. */
  address: string;
  formattedAddress: string;
  valuePoint: number | null;
  confidence: Confidence;
  /** Saved/seen timestamp (ms). */
  at: number;
}

const RECENT_KEY = "homescout:recent";
const SAVED_KEY = "homescout:saved";
const MAX_RECENT = 8;

function read(key: string): StoredProperty[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredProperty[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, items: StoredProperty[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* storage full / disabled — ignore */
  }
}

// ---- recent ----

export function getRecent(): StoredProperty[] {
  return read(RECENT_KEY);
}

export function recordRecent(p: Omit<StoredProperty, "at">): void {
  const items = read(RECENT_KEY).filter((x) => x.slug !== p.slug);
  items.unshift({ ...p, at: Date.now() });
  write(RECENT_KEY, items.slice(0, MAX_RECENT));
}

export function clearRecent(): void {
  write(RECENT_KEY, []);
}

// ---- saved ----

export function getSaved(): StoredProperty[] {
  return read(SAVED_KEY);
}

export function isSaved(slug: string): boolean {
  return read(SAVED_KEY).some((x) => x.slug === slug);
}

export function saveProperty(p: Omit<StoredProperty, "at">): void {
  const items = read(SAVED_KEY).filter((x) => x.slug !== p.slug);
  items.unshift({ ...p, at: Date.now() });
  write(SAVED_KEY, items);
}

export function removeSaved(slug: string): void {
  write(SAVED_KEY, read(SAVED_KEY).filter((x) => x.slug !== slug));
}
