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

**Milestone 2 of 8 — eval harness in place.** The app boots and renders a
clearly-badged **MOCK** dossier; the eval suite (`npm run eval`) runs golden +
adversarial cases through `lookupProperty` with MUST/SHOULD assertions. Real
data (RentCast) lands in Milestone 3.

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
