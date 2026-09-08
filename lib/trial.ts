/**
 * Monthly anonymous trial quota (no account required).
 * - 5 free analyses per calendar month (base model).
 * - 2 Pro trial analyses per calendar month (premium model).
 * - Unused uses do not roll over; both counters reset on the 1st of each month.
 * - Once the Pro trial (2) is used up, the premium model requires a Pro subscription.
 */
export const FREE_TRIAL_LIMIT = 5
export const PRO_TRIAL_LIMIT = 2

function getCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie')
  if (!header) return undefined
  for (const part of header.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (k === name) return decodeURIComponent(v)
  }
  return undefined
}

function currentMonth(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

export type TrialState = {
  freeUsed: number
  freeRemaining: number
  freeLimit: number
  proUsed: number
  proRemaining: number
  proLimit: number
  month: string
  /** Pro trial exhausted — premium model now requires a subscription. */
  proExhausted: boolean
  /** Free tier exhausted — no analyses left without a subscription. */
  freeExhausted: boolean
  /** Both free and Pro trials exhausted. */
  exhausted: boolean
  isPaid: boolean
}

function parseCookie(raw: string): { freeUsed: number; proUsed: number; month: string } {
  const month = currentMonth()
  const [freeStr, proStr, storedMonth] = raw.split(':')
  const freeUsed = storedMonth === month ? parseInt(freeStr || '0', 10) || 0 : 0
  const proUsed = storedMonth === month ? parseInt(proStr || '0', 10) || 0 : 0
  return { freeUsed, proUsed, month }
}

function buildState(freeUsed: number, proUsed: number, month: string, isPaid = false): TrialState {
  const freeRemaining = isPaid ? FREE_TRIAL_LIMIT : Math.max(0, FREE_TRIAL_LIMIT - freeUsed)
  const proRemaining = isPaid ? PRO_TRIAL_LIMIT : Math.max(0, PRO_TRIAL_LIMIT - proUsed)
  return {
    freeUsed,
    freeRemaining,
    freeLimit: FREE_TRIAL_LIMIT,
    proUsed,
    proRemaining,
    proLimit: PRO_TRIAL_LIMIT,
    month,
    proExhausted: proRemaining <= 0,
    freeExhausted: freeRemaining <= 0,
    exhausted: !isPaid && freeRemaining <= 0 && proRemaining <= 0,
    isPaid,
  }
}

/**
 * Read the current trial state from the `rc_trial` cookie, resetting counters
 * if we've entered a new month.
 */
export function getTrialState(req: Request): TrialState {
  const raw = getCookie(req, 'rc_trial') || ''
  const { freeUsed, proUsed, month } = parseCookie(raw)
  return buildState(freeUsed, proUsed, month, false)
}

/**
 * Consume one trial use and decide which model to run.
 * - Paid users: unlimited, always premium.
 * - Anonymous: prefer a Pro (premium) trial use first, then fall back to a free (base) use.
 * Returns `{ ok: false }` only when both free and Pro trials are exhausted.
 */
export function consumeTrial(
  req: Request,
  isPaid: boolean,
): { ok: boolean; usePaidModel: boolean; state: TrialState } {
  if (isPaid) {
    return { ok: true, usePaidModel: true, state: buildState(0, 0, currentMonth(), true) }
  }
  const raw = getCookie(req, 'rc_trial') || ''
  const { freeUsed, proUsed, month } = parseCookie(raw)

  // Prefer the premium Pro trial while it lasts.
  if (proUsed < PRO_TRIAL_LIMIT) {
    return { ok: true, usePaidModel: true, state: buildState(freeUsed, proUsed + 1, month, false) }
  }
  // Fall back to the free base-model tier.
  if (freeUsed < FREE_TRIAL_LIMIT) {
    return { ok: true, usePaidModel: false, state: buildState(freeUsed + 1, proUsed, month, false) }
  }
  // Both exhausted — must subscribe.
  return { ok: false, usePaidModel: false, state: buildState(freeUsed, proUsed, month, false) }
}

/**
 * Cookie value to persist the trial state: `freeUsed:proUsed:month`.
 */
export function trialCookieValue(freeUsed: number, proUsed: number, month?: string): string {
  return `${freeUsed}:${proUsed}:${month || currentMonth()}`
}

/**
 * Cookie options: keep for ~14 months so the counter survives month boundaries.
 */
export const TRIAL_COOKIE_OPTIONS = {
  path: '/',
  maxAge: 60 * 60 * 24 * 400,
  sameSite: 'lax' as const,
}
