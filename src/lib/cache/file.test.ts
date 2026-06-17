import { describe, it, expect } from "vitest";
import os from "node:os";
import path from "node:path";
import { promises as fs } from "node:fs";
import { FileCache } from "./file";
import { getMockDossier } from "@/lib/providers/mock/mockProperty";

describe("FileCache", () => {
  it("stores and retrieves within TTL, misses after expiry and on absent keys", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "homescout-cache-"));
    const cache = new FileCache(dir);
    const dossier = getMockDossier("123 Test St, Austin, TX 78701");

    await cache.set("addr-1", { dossier, fetchedAt: new Date().toISOString() }, 60);
    const hit = await cache.get("addr-1");
    expect(hit?.dossier.id).toBe(dossier.id);

    // ttl 0 → expires immediately.
    await cache.set("addr-2", { dossier, fetchedAt: new Date().toISOString() }, 0);
    await new Promise((r) => setTimeout(r, 5));
    expect(await cache.get("addr-2")).toBeNull();

    // never-set key.
    expect(await cache.get("nope")).toBeNull();
  });
});
