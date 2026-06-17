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

**Milestone 1 of 8 — skeleton with mock data.** The app boots, the home page
search routes to a dossier page that renders a clearly-badged **MOCK** dossier
from the typed mock provider. Real data (RentCast) lands in Milestone 3.

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

## Architecture

All real logic lives in `src/lib/services` behind the verbs (`lookupProperty`,
`pullComps`, `assessRisk`, `scoreDeal`, `summarizeListing`); the UI and API
routes only call these. Every datum is a `Sourced<T>` carrying its source,
confidence, and availability. See [ARCHITECTURE.md](ARCHITECTURE.md).

## License

MIT — see [LICENSE](LICENSE).
