/**
 * Thin, swappable Anthropic adapter. The ONLY place that talks to the LLM.
 *
 * - Missing `ANTHROPIC_API_KEY` → every call returns `{ ok: false }`, so callers
 *   degrade to "Not available" rather than crashing.
 * - Output is forced to JSON via the prompt, parsed defensively (code fences /
 *   surrounding prose stripped), then validated with the caller's Zod schema.
 *   On parse/validation failure we retry once, then fail soft.
 *
 * Models are configurable; per the milestone we default zoning to a cheaper/
 * faster model and the deal read to a stronger one.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { ZodType } from "zod";
import { env } from "@/lib/config/env";

export const LLM_MODELS = {
  zoning: process.env.LLM_ZONING_MODEL || "claude-haiku-4-5",
  deal: process.env.LLM_DEAL_MODEL || "claude-sonnet-4-6",
} as const;

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!env.ANTHROPIC_API_KEY) return null;
  if (!cachedClient) {
    cachedClient = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      timeout: 30_000,
      maxRetries: 1,
    });
  }
  return cachedClient;
}

/** Whether AI explanations are available (a key is configured). */
export function llmConfigured(): boolean {
  return Boolean(env.ANTHROPIC_API_KEY);
}

/** Extract a JSON object from a model response (tolerate fences / prose). */
function parseJsonLoose(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  const slice = start !== -1 && end !== -1 ? candidate.slice(start, end + 1) : candidate;
  return JSON.parse(slice);
}

export async function llmJson<T>(opts: {
  system: string;
  user: string;
  schema: ZodType<T>;
  model?: string;
  maxTokens?: number;
}): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const client = getClient();
  if (!client) return { ok: false, error: "AI explanation not configured" };

  const model = opts.model ?? LLM_MODELS.zoning;
  const maxTokens = opts.maxTokens ?? 1024;
  const system = `${opts.system}\n\nReturn ONLY a single valid JSON object that matches the requested shape. No markdown, no code fences, no commentary.`;

  let lastError = "no output";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: opts.user }],
      });

      if (res.stop_reason === "refusal") {
        lastError = "model refused";
        continue;
      }
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const parsed = opts.schema.safeParse(parseJsonLoose(text));
      if (parsed.success) return { ok: true, data: parsed.data };
      lastError = "schema validation failed";
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[llm] attempt ${attempt + 1} failed: ${lastError}`);
      }
    }
  }
  return { ok: false, error: lastError };
}
