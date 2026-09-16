// Best-effort in-memory rate limiter for anonymous/serverless abuse protection.
// NOTE: on serverless multi-instance deploys this is per-instance; it is a
// deterrent, not a hard guarantee. The public API also enforces a per-key
// Postgres limit (see supabase/api_key_rate_buckets.sql).
const buckets = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 12

export function rateLimitIp(
  ip: string | null,
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const key = ip || "unknown"
  const now = Date.now()
  const hits = (buckets.get(key) || []).filter((t) => now - t < WINDOW_MS)
  if (hits.length >= MAX_PER_WINDOW) {
    buckets.set(key, hits)
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((WINDOW_MS - (now - hits[0])) / 1000),
    }
  }
  hits.push(now)
  buckets.set(key, hits)
  return {
    allowed: true,
    remaining: MAX_PER_WINDOW - hits.length,
    retryAfterSeconds: 0,
  }
}
