# Contributing to Homescout

Homescout is MIT-licensed and contributions are welcome.

## Running locally

- Node 20+ and npm.
- `npm install`, `cp .env.example .env`, then `npm run dev` (mock data by default).
- Optional Postgres cache: `docker compose up -d` then `npm run db:migrate`.

## Rules every change must preserve

These are the project's two hard lines — a PR that breaks either will not be merged:

1. **Respect data-source terms — no scraping.** Official APIs and public/gov
   data only. **Never** scrape Zillow, Redfin, or Realtor.com — not even as a
   fallback. If a feature seems to need listing content, flag it instead.
2. **Information, not advice — no fabrication.** Every value carries a source,
   confidence, and availability. Missing data renders **"Not available"** — never
   a zero, a blank, or a guess. The deal read must never emit an absolute verdict
   or mention a figure that isn't in the dossier (the guardrail enforces this).
3. **Clean service layer.** All logic lives in `src/lib/services` behind the
   verbs; UI and API routes stay thin.
4. **No OpenSwarm / MCP code.** That's a later phase; keep it out of this repo.

## Before opening a PR

Run the full check — all must pass:

```bash
npm run typecheck && npm run lint && npm test && npm run eval && npm run build
```

`npm run eval` is the safety net against silently-wrong data. If your change
touches data handling, scoring, or the LLM, **add a golden case** in `evals/cases/`
(including an adversarial one) so the behavior is protected going forward.
