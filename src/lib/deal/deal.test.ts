import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { getMockDossier } from "@/lib/providers/mock/mockProperty";
import { DealReadLlmSchema, ZoningExplanationSchema } from "@/lib/schemas/llm";
import { finalizeDeal } from "@/lib/services/scoreDeal";
import { mapZoningExplanation } from "@/lib/services/explainZoning";
import { computeDealSignals, type DealSignals } from "./signals";
import { bannedVerdict, ungroundedFigures } from "./guardrail";

function fx(name: string): unknown {
  return JSON.parse(readFileSync(`evals/fixtures/llm/${name}`, "utf8"));
}

// Signals consistent with the mock dossier (value 450k, rent 2600, yield ~6.9%).
function mockSignals(): DealSignals {
  const m = getMockDossier("123 Test St, Austin, TX 78701");
  return computeDealSignals({
    valuation: m.valuation,
    flood: m.flood,
    neighborhood: m.neighborhood,
  });
}

describe("guardrail", () => {
  it("flags banned-verdict phrasing", () => {
    expect(bannedVerdict("you should buy this — it's a safe investment")).not.toBeNull();
    expect(bannedVerdict("the asking price appears modestly above the range")).toBeNull();
  });

  it("flags figures not grounded in the dossier", () => {
    const cands = { usd: [450000, 2600], pct: [6.9] };
    expect(ungroundedFigures("yield is 6.9% on a $450,000 home", cands)).toHaveLength(0);
    expect(ungroundedFigures("value is $999,999 and yield 42%", cands).length).toBeGreaterThan(0);
  });
});

describe("computeDealSignals", () => {
  it("derives yield and confidence from real numbers", () => {
    const s = mockSignals();
    expect(s.valuePoint).toBe(450000);
    expect(s.rentPoint).toBe(2600);
    expect(s.grossYieldPct).toBeCloseTo(6.9, 1);
    expect(["high", "medium", "low"]).toContain(s.confidence);
  });
});

describe("finalizeDeal", () => {
  it("uses a clean, grounded LLM summary", () => {
    const data = DealReadLlmSchema.parse(fx("deal-good.json"));
    const deal = finalizeDeal({ ok: true, data }, mockSignals());
    expect(deal.summary.availability).toBe("available");
    expect(deal.summary.value).toContain("6.9%");
    expect(bannedVerdict(deal.summary.value!)).toBeNull();
  });

  it("replaces banned-verdict output with the safe template", () => {
    const data = DealReadLlmSchema.parse(fx("deal-banned.json"));
    const deal = finalizeDeal({ ok: true, data }, mockSignals());
    expect(bannedVerdict(deal.summary.value!)).toBeNull(); // template is clean
    expect(deal.summary.value).not.toContain("safe investment");
    expect(deal.summary.value).toMatch(/informational only/i);
  });

  it("replaces invented-figure output with the safe template", () => {
    const data = DealReadLlmSchema.parse(fx("deal-invented.json"));
    const s = mockSignals();
    const deal = finalizeDeal({ ok: true, data }, s);
    expect(deal.summary.value).not.toContain("999,999");
    // The template only cites grounded figures.
    expect(ungroundedFigures(deal.summary.value!, {
      usd: [s.valuePoint!, s.valueLow!, s.valueHigh!, s.rentPoint!],
      pct: [s.grossYieldPct!, s.estimateWidthPct ?? s.grossYieldPct!],
    })).toHaveLength(0);
  });

  it("falls back to the safe template when the LLM fails", () => {
    const deal = finalizeDeal({ ok: false, error: "boom" }, mockSignals());
    expect(deal.summary.availability).toBe("available");
    expect(bannedVerdict(deal.summary.value!)).toBeNull();
  });

  it("never lets the model inflate confidence above the data-derived level", () => {
    const data = DealReadLlmSchema.parse(fx("deal-good.json"));
    const s = { ...mockSignals(), confidence: "low" as const };
    const deal = finalizeDeal({ ok: true, data }, s); // model said "medium"
    expect(deal.confidence).toBe("low");
  });
});

describe("mapZoningExplanation", () => {
  it("maps a confident residential explanation", () => {
    const data = ZoningExplanationSchema.parse(fx("zoning-good.json"));
    const s = mapZoningExplanation(data);
    expect(s.availability).toBe("available");
    expect(s.value).toMatch(/residential/i);
    expect(s.confidence).toBe("high");
  });

  it("downgrades confidence when the model is unsure (unknown category)", () => {
    const data = ZoningExplanationSchema.parse(fx("zoning-unknown.json"));
    const s = mapZoningExplanation(data);
    expect(s.confidence).toBe("low"); // downgraded despite model's "high"
  });
});
