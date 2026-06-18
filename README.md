# Homescout

A consumer property-search copilot. Paste a US address → get a plain-English
**dossier** built from public/licensed data: ownership & last sale, value and
rent estimates (with ranges), comparable sales & rentals, zoning, and risk
signals — capped with a grounded "is this a good deal?" read.

**Information, not advice.** Homescout is not an appraiser or financial advisor.
Every value shows a **range + confidence + its source**. When data is thin we say
so and lower the confidence — we never show an absolute verdict or a fabricated
number. Missing data renders as "Not available", never a zero or a guess.

It's the consumer flip of YC's Travo — we clone the *search-a-property → instant
dossier* experience for renters and buyers using public data, **not** their
brand and **not** their niche-CRE dataset / data-collection engine. We never
scrape Zillow, Redfin, or Realtor.com.

## Project status

**Milestone 5 of 8 — risk & quality signals.** The dossier now includes a
**risk & neighborhood** layer from free government / open data: **FEMA flood
zone** (keyless, live-verified), **Walk Score** walkability, **Census ACS**
demographics, and **area crime context**. All fetched in parallel, each tagged
with its source/confidence, and every signal degrades gracefully to "Not
available" — never fabricated.

Earlier milestones: polished dossier UI + interactive MapLibre map (M4), real
RentCast + Census-geocoded lookup with caching (M3), eval harness (M2). Zoning
plain-English and the deal narrative are next (M6). The default is still mocks
(`USE_MOCKS=true`), so a fresh clone runs offline.

## Prerequisites

- Node 20+ (developed on Node 25).
- npm.

## Setup

```bash
npm install
cp .env.example .env   # USE_MOCKS=true by default — runs fully offline on mocks
npm run dev
```

Open http://localhost:3000 and search any address. With `USE_MOCKS=true` (the
default) every dossier is mock data, badged accordingly.

## Real data setup (RentCast)

Real dossiers come from [RentCast](https://www.rentcast.io/api) (property
records, ownership, tax, value/rent AVM + comps).

1. Create a free RentCast account and copy your API key (free **Developer tier =
   50 API calls/month**, no credit card).
2. In `.env`, set:
   ```bash
   RENTCAST_API_KEY=your_key_here
   USE_MOCKS=false
   ```
3. Restart `npm run dev` and search a real US residential address.

**Quota matters.** A full dossier is up to 3 RentCast calls (`/properties`,
`/avm/value`, `/avm/rent/long-term`) — ~16 dossiers/month on the free tier. Two
protections:

- **Caching.** Every lookup is cached by normalized address (JSON files under
  `.cache/`, gitignored). A repeat lookup costs **0 API calls**. TTL is
  `CACHE_TTL_DAYS` (default 7). Add `&refresh=true` to the API to bypass it.
- **Mocks for dev.** Keep `USE_MOCKS=true` while building; only flip to `false`
  for targeted real checks. The console logs a running RentCast call count.

When RentCast has no coverage for an address (or your key is missing/over
quota), the dossier still renders — every affected field shows **"Not
available"** with a note and lower confidence. It never invents a number.

## Data sources

| Source | Role | Key? | Terms |
|---|---|---|---|
| [RentCast](https://www.rentcast.io/api) | Property record, ownership, tax, value/rent AVM, comps | Yes (free tier) | Licensed; **no attribution required**. |
| [US Census Geocoder](https://geocoding.geo.census.gov/) | Address → lat/lng + county + tract (primary) | No | Free, public domain. |
| [Nominatim / OSM](https://nominatim.org/) | Geocoding fallback | No | ≤1 req/s, custom User-Agent, cache results (we do all three). |
| [FEMA NFHL](https://www.fema.gov/flood-maps/national-flood-hazard-layer) | Flood zone + SFHA determination | **No** | Free, public. Informational — not a certified flood determination. |
| [Walk Score](https://www.walkscore.com/professional/api.php) | Walk / Transit / Bike scores | Yes (free) | **Walk Score® attribution + link required** (shown in the UI). |
| [US Census ACS](https://www.census.gov/data/developers/data-sets/acs-5year.html) | Median income, owner-occupied rate | Yes (free) | Free, public domain. Key now required for ACS data. |
| FBI Crime Data API | Area crime context | — | **Deliberately omitted** — only state-level data exists, too coarse to present responsibly per property; rendered "Not available". |

We use **official APIs and public/gov data only**. We never scrape Zillow,
Redfin, or Realtor.com — not even as a fallback. Crime is **area-level context,
never a safety verdict**; flood is **informational, not a certified
determination**; every signal degrades to "Not available" rather than guessing.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server. |
| `npm run build` | Production build. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint. |
| `npm test` | Vitest unit tests. |
| `npm run eval` | Run the eval suite (fails non-zero on any MUST failure). |
| `npm run eval:json` | Same, plus write `evals/last-run.json`. |

## Evals

The eval suite (`evals/`) is the safety net against the failure mode that
matters here: **a confident answer over thin data.** It runs golden cases —
including adversarial ones (rural/uncovered addresses, forced-null fields,
high/low-cost markets) — through `lookupProperty` and asserts judgment-quality
and data-safety properties.

Two assertion tiers:

- **MUST** (hard): safety/correctness that must always hold — no fabricated
  values, coherent value/rent ranges, no absolute verdict, and **low confidence
  on thin coverage**. A single MUST failure fails the run (non-zero exit).
- **SHOULD** (soft): quality targets tracked as a pass-rate. Checks that need
  real providers or the LLM (e.g. "value range contains the known sale price",
  flood-zone match, zoning plain-English) are wired but **skipped** until the
  owning milestone (M3/M5/M6) turns them on.

```bash
npm run eval
```

The mock provider has sentinel inputs (`__thin__`, `__null__`) so the
thin-coverage and no-fabrication MUSTs are genuinely exercised today; the same
cases keep working when real providers land, because a real sparse area produces
the same shape.

## Architecture

All real logic lives in `src/lib/services` behind the verbs (`lookupProperty`,
`pullComps`, `assessRisk`, `scoreDeal`, `summarizeListing`); the UI and API
routes only call these. Every datum is a `Sourced<T>` carrying its source,
confidence, and availability. See [ARCHITECTURE.md](ARCHITECTURE.md).

## License

MIT — see [LICENSE](LICENSE).
