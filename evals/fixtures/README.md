# Eval fixtures

Ground-truth data and recorded provider responses for the eval suite.

## Ground truth in cases

For now, per-case ground truth (known sale price, known flood zone, expected
confidence) lives inline in each `evals/cases/*.ts` file under `groundTruth`.
Several values are marked **illustrative** — replace them with verified records
when the real-data path lands (M3/M5).

## Recorded provider responses (added in M3)

To test mapping logic without spending RentCast's 50-call/month free tier, M3
captures a few real RentCast JSON responses here:

```
evals/fixtures/rentcast/
  well-covered.json   # a property with full coverage
  partial.json        # a property with some fields missing
  not-found.json      # an empty / 404-style response
```

These are loaded by unit tests for `mapRentCastProperty` / `mapRentCastAvm`,
which assert correct `Sourced` mapping, null-handling, and confidence — with **no
network**. Scrub any sensitive owner PII to initials before committing, and note
in the repo README that these are sample responses.

## Adding a new golden case

1. Pick the right file in `evals/cases/` (or add one and wire it into
   `cases/index.ts`).
2. Give it a unique `id`, a real address, and any `groundTruth` you can verify.
3. Add `assertions`. Use the helpers in `evals/assertions.ts`:
   - **MUST** for safety/correctness (no fabrication, coherent range, no
     absolute verdict, confidence-at-most). These must hold against mock and
     real data alike.
   - **SHOULD** for quality targets. Mark anything that needs real
     providers/LLM as `skip(...)` until the owning milestone (M3/M5/M6) turns
     it on.
4. Run `npm run eval`. A single MUST failure fails the suite (non-zero exit).
