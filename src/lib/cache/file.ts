import { promises as fs } from "node:fs";
import path from "node:path";
import type { Cache, CachedDossier } from "./types";

interface Envelope {
  value: CachedDossier;
  /** Epoch ms after which this entry is stale. */
  expiresAt: number;
}

const DEFAULT_DIR = path.join(process.cwd(), ".cache", "dossiers");

/**
 * Dependency-light JSON-file cache (one file per key). Chosen over a native
 * SQLite module to keep a clean-clone `npm install` build-free on any Node
 * version. Behind the {@link Cache} interface, so M7 can swap to Postgres.
 */
export class FileCache implements Cache {
  private readonly dir: string;

  constructor(dir: string = DEFAULT_DIR) {
    this.dir = dir;
  }

  private fileFor(key: string): string {
    const safe = key.replace(/[^a-z0-9_-]/gi, "_").slice(0, 200) || "key";
    return path.join(this.dir, `${safe}.json`);
  }

  async get(key: string): Promise<CachedDossier | null> {
    try {
      const raw = await fs.readFile(this.fileFor(key), "utf8");
      const env = JSON.parse(raw) as Envelope;
      if (typeof env.expiresAt !== "number" || Date.now() > env.expiresAt) {
        return null;
      }
      return env.value;
    } catch {
      return null; // missing/corrupt entry → treat as a miss
    }
  }

  async set(
    key: string,
    value: CachedDossier,
    ttlSeconds: number,
  ): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
    const env: Envelope = {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    };
    const file = this.fileFor(key);
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(env));
    await fs.rename(tmp, file); // atomic replace
  }
}
