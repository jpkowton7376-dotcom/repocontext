/**
 * Public API key management.
 *
 * Keys look like `rc_live_<43 base64url chars>` (256 bits of entropy)
 * — same shape as Stripe / Resend / Cloudflare tokens.
 *
 * Storage model:
 *   - plaintext is returned to the user ONCE at creation time.
 *   - we persist the SHA-256 hash and the first 8 plaintext chars
 *     (e.g. "rc_live_aB3xQ") as a human-readable prefix.
 *   - verification compares the hash of the inbound bearer token.
 *
 * The verify step also has to deal with two failure modes:
 *   1. token never existed (hash not in db) — invalid.
 *   2. token existed but was revoked (revoked_at != null) — tell the
 *      user it was revoked, not that it's invalid, so they can tell
 *      their key was leaked from a forgotten laptop.
 */
import { createHash, randomBytes } from "crypto"
import type { SupabaseClient } from "@supabase/supabase-js"

/** Prefix every key ships with so it is recognisable in logs. */
export const API_KEY_PREFIX = "rc_live_"

/** Maximum number of active keys per account. */
export const MAX_KEYS_PER_USER = 5

/** Default per-minute rate limit applied at creation. */
export const DEFAULT_RATE_LIMIT = 30

/** Length of the random part of the key, in base64url chars. */
const RANDOM_BYTES = 32

/** A row in the api_keys table as returned by Supabase. */
export interface ApiKeyRow {
  id: string
  user_id: string
  key_hash: string
  key_prefix: string
  name: string
  revoked_at: string | null
  last_used_at: string | null
  rate_limit_per_minute: number
  created_at: string
}

/** Result of verifying a bearer token. */
export type VerifyResult =
  | { ok: true; key: ApiKeyRow }
  | { ok: false; reason: "missing" | "revoked" | "malformed" }

/**
 * Generates a fresh plaintext API key and returns both the plaintext
 * (to show the user once) and the derived rows to persist.
 *
 * Returns `{ error }` rather than throwing so route handlers can pass
 * the message back to the client directly.
 */
export function generateApiKey(): {
  plaintext: string
  hash: string
  prefix: string
} | null {
  try {
    const random = randomBytes(RANDOM_BYTES).toString("base64url")
    const plaintext = `${API_KEY_PREFIX}${random}`
    return {
      plaintext,
      hash: hashKey(plaintext),
      prefix: plaintext.slice(0, 12), // "rc_live_aB3x" — first 12 chars
    }
  } catch {
    return null
  }
}

/** SHA-256 hash, hex-encoded, matching the column in api_keys. */
export function hashKey(plaintext: string): string {
  return createHash("sha256").update(plaintext, "utf8").digest("hex")
}

/**
 * Extracts a bearer token from an Authorization header. Accepts:
 *   "Bearer rc_live_xxx"
 *   "bearer rc_live_xxx"        (case-insensitive scheme)
 *   "rc_live_xxx"               (scheme is optional for curl friendliness)
 */
export function extractBearer(authHeader: string | null): string | null {
  if (!authHeader) return null
  const trimmed = authHeader.trim()
  if (!trimmed) return null

  // Scheme + token.
  const m = trimmed.match(/^(?:Bearer)\s+(\S+)$/i)
  if (m) return m[1]

  // Bare token. Only accept if it has the rc_live_ prefix so we don't
  // confuse this with the Supabase JWT in dev tools.
  if (trimmed.startsWith(API_KEY_PREFIX)) return trimmed

  return null
}

/** Validates the format of a key without hitting the database. */
export function isWellFormed(token: string): boolean {
  if (!token || !token.startsWith(API_KEY_PREFIX)) return false
  // 7 (prefix) + 43 (32 random bytes → base64url, unpadded)
  return token.length === API_KEY_PREFIX.length + 43
}

/**
 * Looks up a key by plaintext and returns whether it is valid.
 * Admin client is required because the regular user client cannot
 * SELECT by key_hash (we only expose by user_id through RLS).
 */
export async function verifyApiKey(
  admin: SupabaseClient,
  token: string,
): Promise<VerifyResult> {
  if (!isWellFormed(token)) return { ok: false, reason: "malformed" }

  const { data, error } = await admin
    .from("api_keys")
    .select("*")
    .eq("key_hash", hashKey(token))
    .maybeSingle()

  if (error) {
    console.error("[api-keys] verify failed:", error)
    return { ok: false, reason: "missing" }
  }
  if (!data) return { ok: false, reason: "missing" }
  if (data.revoked_at) return { ok: false, reason: "revoked" }

  return { ok: true, key: data as ApiKeyRow }
}

/** Marks a key as revoked. Idempotent. */
export async function revokeApiKey(
  admin: SupabaseClient,
  keyId: string,
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await admin
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("user_id", userId)
    .is("revoked_at", null)
  if (error) {
    console.error("[api-keys] revoke failed:", error)
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

/** Touches last_used_at. Best-effort; never throws. */
export async function touchApiKey(
  admin: SupabaseClient,
  keyId: string,
): Promise<void> {
  try {
    await admin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyId)
  } catch (err) {
    console.error("[api-keys] touch failed:", err)
  }
}