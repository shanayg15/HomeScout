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

> **Not affiliated with Travo.** Homescout is an independent open-source
> implementation of the *idea* (search a property → instant dossier) on
> public/licensed data — none of Travo's brand, copy, code, or niche-CRE dataset.

## Project status

**v1 — complete.** Paste an address (or a listing link) → a readable,
plain-English dossier from public/licensed data: ownership/tax, value & rent
estimates with ranges + comps on an interactive map, FEMA flood + walkability +
demographics, a plain-English zoning explanation, and a grounded "is this a good
deal?" read — every value carrying its source, confidence, and freshness, and
nothing ever fabricated. Saved/recent lookups, optional Postgres persistence, and
an adversarial eval suite round it out. Runs offline on mocks by default; add keys
to unlock real data (each optional, each degrades gracefully).

## Listing links & asking price

- **Listing links (ToS-safe).** Paste a listing URL and we extract **only the
  address from the URL string** — we never fetch the page, and never copy a
  listing's price, description, photos, or any content. If we can't read an
  address from the link, we ask you to paste it. The metadata-fetch allowlist is
  intentionally empty (Zillow/Redfin/Realtor.com are not on it).
- **Asking price.** Optionally enter an asking price on the dossier (we never
  scrape it). It flows into the deal read — "your asking is within / N% above the
  estimated range" — clearly labeled as your figure, not our estimate.

## Demo (try these)

Real, well-covered addresses that show the app at its best (real with a RentCast
key; clearly-badged mock otherwise):

- `5500 Grand Lake Dr, San Antonio, TX 78244`
- `1600 Pennsylvania Ave NW, Washington, DC 20500`
- `1 Beach Rd, Galveston, TX 77550` (coastal — a real FEMA flood zone)
- A listing link, e.g. `https://www.zillow.com/homedetails/5500-Grand-Lake-Dr-San-Antonio-TX-78244/12345_zpid/`
  → resolves to the address, then the standard public-data dossier.

## Future: OpenSwarm packaging (not part of v1)

The clean `lib/services` layer is designed so a later phase can wrap the verbs
(`lookupProperty`, `pullComps`, `assessRisk`, `scoreDeal`, `summarizeListing`) as
an MCP server + SKILL.md + View + Cron — reusing everything here. **None of that
is built in this repo.** See [ARCHITECTURE.md](ARCHITECTURE.md).

## AI explanations

The LLM (Anthropic, behind a thin adapter in `src/lib/llm/`) does exactly two
things, and only ever **explains grounded numbers** — it never gives advice or
invents figures:

- **Zoning plain-English** — a short, conservative explanation of a zoning code
  (defaults to a cheaper/faster model). If unsure, it says so rather than
  overstating permitted uses, and always tells you to confirm with the
  municipality.
- **The deal read** — a hedged, sourced, confidence-rated summary over the
  deterministic signals (yield, asking-vs-estimate). A mandatory code-side
  guardrail rejects absolute-verdict language and any dollar/percent figure not
  present in the dossier, substituting a safe templated read; the final
  confidence is never higher than the data supports.

Set `ANTHROPIC_API_KEY` to enable them (optional — they degrade to "Not
available" without it). Models are overridable via `LLM_ZONING_MODEL` /
`LLM_DEAL_MODEL`.

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
| `npm run db:generate` | Generate Drizzle migrations from the schema. |
| `npm run db:migrate` | Apply migrations (after `docker compose up -d`). |

## Persistence (optional Postgres)

The lookup cache works out of the box as a local JSON-file cache (under
`.cache/`, gitignored) — no setup required. To use Postgres instead (shared,
survives restarts):

```bash
docker compose up -d                 # Postgres + pgvector on port 5450
echo 'DATABASE_URL=postgres://homescout:homescout@localhost:5450/homescout' >> .env
npm run db:migrate
```

The app picks Postgres automatically when `DATABASE_URL` is set, and falls back
to the file cache when it isn't. **Saved and recent lookups are local-first**
(stored in your browser's `localStorage`, never sent to a server) — there are no
accounts and no server-side personal data.

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
