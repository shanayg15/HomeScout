/**
 * Small typed fetch wrapper shared by the data providers: an `AbortController`
 * timeout, a single retry on network/abort errors (never on HTTP error
 * responses), and structured error types the service layer can branch on.
 */

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class RateLimitedError extends Error {
  constructor(message = "Rate limited") {
    super(message);
    this.name = "RateLimitedError";
  }
}

export class ProviderError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
  }
}

export interface FetchOpts {
  timeoutMs?: number;
  /** Retries on network/abort errors only. */
  retries?: number;
  headers?: Record<string, string>;
}

export async function fetchJson<T = unknown>(
  url: string,
  opts: FetchOpts = {},
): Promise<T> {
  const { timeoutMs = 10_000, retries = 1, headers } = opts;
  let lastNetworkError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) {
        if (res.status === 404) throw new NotFoundError(`404 from ${url}`);
        if (res.status === 429) throw new RateLimitedError(`429 from ${url}`);
        throw new ProviderError(`HTTP ${res.status} from ${url}`, res.status);
      }
      return (await res.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      // Typed HTTP errors are terminal - do not retry them.
      if (
        err instanceof NotFoundError ||
        err instanceof RateLimitedError ||
        err instanceof ProviderError
      ) {
        throw err;
      }
      lastNetworkError = err; // network/abort - retry if attempts remain
    }
  }

  throw new ProviderError(
    `Network error from ${url}: ${
      lastNetworkError instanceof Error
        ? lastNetworkError.message
        : String(lastNetworkError)
    }`,
  );
}
