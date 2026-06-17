/**
 * In-process RentCast call counter. The free Developer tier is 50 calls/month,
 * so this makes it obvious in the logs when quota is being burned. (Per-process
 * only — resets on restart; the cache is what actually protects quota.)
 */
let count = 0;

export function recordRentCastCall(endpoint: string): void {
  count += 1;
  if (process.env.NODE_ENV !== "production") {
    console.log(`[rentcast] call #${count} → ${endpoint}`);
  }
}

export function rentCastCallCount(): number {
  return count;
}
