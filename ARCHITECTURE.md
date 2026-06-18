# Architecture

Homescout is a Next.js (App Router) + TypeScript app. The guiding rule is a
**clean, separable service layer**: every capability is a verb in
`src/lib/services`, and the UI / API routes are thin callers.

## The service layer (`src/lib/services`)

| Verb | Responsibility | Status |
|---|---|---|
| `lookupProperty` | Orchestrates a full dossier for an address. | Mock (M1); real RentCast + geocoding + cache in M3. |
| `pullComps` | Value/rent estimates + sale/rental comps. | Stub → M3. |
| `assessRisk` | FEMA flood, Walk Score, Census ACS, crime context. | Stub → M5. |
| `scoreDeal` | Deterministic yield math + LLM "good deal?" read. | Stub → M6. |
| `summarizeListing` | ToS-safe address extraction from a listing URL. | Stub → M8. |

The UI never contains business logic. This is also what keeps a *future*
OpenSwarm/MCP wrapper a thin layer that reuses `lib/services` — **not built now,
and no OpenSwarm/MCP code exists in this repo.**

## Providers (`src/lib/providers`)

Swappable data-source adapters behind small interfaces (`providers/types.ts`):
`GeocodeProvider`, `PropertyProvider`, `ValuationProvider`, `RiskProvider`. The
mock provider (`providers/mock`) implements the same dossier shape so the
service layer never depends on a concrete source.

**Provider selection.** `providers/index.ts` exports `getProviders()`, which
returns the REAL adapters (RentCast + Census/Nominatim geocoding). The mock path
bypasses this entirely — when `USE_MOCKS=true`, `lookupProperty` returns the
monolithic mock dossier directly (so the eval sentinels keep working), and
`getProviders()` is only used when `USE_MOCKS=false`.

**RentCast adapter** (`providers/property/rentcast.ts`): a typed `fetchJson`
wrapper (`providers/http.ts`) with a timeout, one retry on network errors, and
structured errors (`NotFoundError`/`RateLimitedError`/`ProviderError`); Zod
validation of the raw response (degrading to "unavailable" on a mismatch rather
than throwing the page); and pure mappers (`mapRentCast.ts`, unit-tested against
fixtures) that wrap each field in a `Sourced<>`. A per-process call counter logs
RentCast usage against the 50/month free tier.

**Risk providers** (`providers/risk/*`): FEMA NFHL flood (keyless), Walk Score,
Census ACS, and crime. `assessRisk` fetches all four with **`Promise.allSettled`
in parallel**, so one slow/failed source never blocks the others, and assembles
the `FloodRisk` + `Neighborhood` sections. Each provider catches internally and
degrades to "unavailable" — a missing key or no coverage is never an error and
never a fabricated value. Crime is deliberately omitted (state-level data is too
coarse to present per-property); it renders "Not available" with a reason.

## Cache (`src/lib/cache`)

```ts
interface Cache {
  get(key: string): Promise<CachedDossier | null>;
  set(key: string, value: CachedDossier, ttlSeconds: number): Promise<void>;
}
```

Keyed by the normalized address slug, so a repeat lookup costs **0 API calls**.
The M3 impl (`FileCache`) is a dependency-light JSON-file cache (one file per key
under `.cache/`) — chosen over a native SQLite module to keep a clean-clone
`npm install` build-free on any Node version. TTLs: a found dossier lives
`CACHE_TTL_DAYS` (default 7); a not-found result is cached for 1 day; a transient
provider error is **never** cached (so adding a key / waiting out a rate limit
re-fetches). M7 swaps `FileCache` for Postgres behind the same interface.

## The `Sourced<T>` provenance pattern

Defined in `src/lib/types/dossier.ts`. Every datum is wrapped:

```ts
interface Sourced<T> {
  value: T | null;
  source: DataSource;       // rentcast | census | fema | … | mock
  confidence: Confidence;   // high | medium | low | unknown
  availability: Availability;// available | partial | unavailable
  asOf?: string;            // freshness
  note?: string;            // e.g. "no county coverage"
}
```

**Invariant:** when `availability === "unavailable"`, `value` must be `null`.
This is the structural form of the "information, not advice" hard line — it is
enforced by the Zod schema (`src/lib/schemas/dossier.ts`) and exercised by the
eval harness (M2). The UI renders unavailable values as "Not available" + note,
never a fabricated placeholder.

## Validation

`src/lib/schemas/dossier.ts` holds strict Zod schemas mirroring the types.
`validateDossier()` parses provider/assembled output and throws on any shape or
fabrication-invariant violation, so silently-wrong data fails loudly.

## Data sources (filled in from M3)

RentCast (property record, ownership, tax, value/rent estimates, comps; licensed,
no attribution required), US Census Geocoder + Nominatim (geocoding), FEMA
(flood), Walk Score, Census ACS (demographics), FBI Crime (area context). Official
APIs and public/gov data only — **never** scraping listing sites.
