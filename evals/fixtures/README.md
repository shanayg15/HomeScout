# Eval fixtures

Ground-truth data and recorded provider responses for the eval suite.

## Ground truth in cases

For now, per-case ground truth (known sale price, known flood zone, expected
confidence) lives inline in each `evals/cases/*.ts` file under `groundTruth`.
Several values are marked **illustrative** — replace them with verified records
when the real-data path lands (M3/M5).

## RentCast response fixtures (M3)

To test mapping logic without spending RentCast's 50-call/month free tier:

```
evals/fixtures/rentcast/
  property-well-covered.json   # full property record (array)
  property-partial.json        # record with several fields missing/null
  property-not-found.json      # empty array [] (no match)
  avm-value.json               # value AVM + 6 sale comps
  avm-rent.json                # rent AVM + 4 rental comps
```

> **These are SYNTHETIC samples shaped to the live-verified RentCast schema**
> (developers.rentcast.io, verified June 2026), not captures from a live key —
> the build was done without a RentCast key. Field names/shapes (e.g.
> `owner.names[]`, year-keyed `taxAssessments`, comp `correlation`, rent value in
> `price`) match the real API. Replace them with real captures once a key is
> available (scrub owner PII to initials before committing).

They are loaded by `src/lib/providers/property/mapRentCast.test.ts`, which
asserts correct `Sourced` mapping, null-handling (no fabrication), and the AVM
confidence heuristic — with **no network**.

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
