/**
 * Local history of analyses for visitors who aren't signed in.
 *
 * The main flow used to stash the result in `sessionStorage` only, which
 * means it vanished on refresh and was invisible to other tabs — and
 * anonymous users have no row in `analyses` to fall back on. We now keep
 * the newest N payloads in `localStorage` behind a small metadata index:
 *
 *   rc_recent_analyses            → RecentAnalysis[]   (newest first)
 *   rc_result:<encoded repo url>  → the full payload
 *
 * Everything is best-effort: private-mode browsers and full quotas simply
 * degrade to "no history", the same behaviour as before.
 */

export type RecentAnalysis = {
  repoUrl: string
  repoName: string
  quality: number
  savedAt: string
}

const INDEX_KEY = "rc_recent_analyses"
const PAYLOAD_PREFIX = "rc_result:"
const MAX_ENTRIES = 10

function safeLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function payloadKey(repoUrl: string): string {
  return PAYLOAD_PREFIX + encodeURIComponent(repoUrl)
}

/** Newest-first list of recent analyses. Never throws. */
export function readRecent(): RecentAnalysis[] {
  const store = safeLocalStorage()
  if (!store) return []
  try {
    const raw = store.getItem(INDEX_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as RecentAnalysis[]) : []
  } catch {
    return []
  }
}

function writeIndex(store: Storage, index: RecentAnalysis[]) {
  try {
    store.setItem(INDEX_KEY, JSON.stringify(index))
  } catch {
    // Quota: drop the oldest entries and retry once with a shorter list.
    try {
      store.setItem(INDEX_KEY, JSON.stringify(index.slice(0, 3)))
    } catch {
      /* give up quietly — history is a nice-to-have */
    }
  }
}

/**
 * Stores one analysis result and moves it to the front of the history.
 * Payloads for entries that fall off the end are deleted so the quota
 * isn't consumed by results the user can no longer reach.
 */
export function saveRecent(repoUrl: string, data: unknown): void {
  const store = safeLocalStorage()
  if (!store || !repoUrl) return

  const quality =
    (data as { quality?: { score?: number } } | null)?.quality?.score ?? 0
  const repoName =
    (data as { repo?: { fullName?: string } } | null)?.repo?.fullName || repoUrl

  const previous = readRecent()
  const index = previous.filter((entry) => entry.repoUrl !== repoUrl)
  index.unshift({
    repoUrl,
    repoName,
    quality,
    savedAt: new Date().toISOString(),
  })
  const kept = index.slice(0, MAX_ENTRIES)

  try {
    store.setItem(payloadKey(repoUrl), JSON.stringify(data))
  } catch {
    // Payload too large to keep — still record it in the index so the user
    // at least sees that they ran it, and can re-run from the URL.
  }

  writeIndex(store, kept)

  // Prune payloads that just fell off the end of the index.
  const live = new Set(kept.map((e) => e.repoUrl))
  for (const entry of previous) {
    if (!live.has(entry.repoUrl)) {
      try {
        store.removeItem(payloadKey(entry.repoUrl))
      } catch {
        /* ignore */
      }
    }
  }
}

/** Loads a stored payload, or null when it isn't cached any more. */
export function loadRecent(repoUrl: string): unknown | null {
  const store = safeLocalStorage()
  if (!store || !repoUrl) return null
  try {
    const raw = store.getItem(payloadKey(repoUrl))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Drops one entry from the index and its payload. */
export function forgetRecent(repoUrl: string): void {
  const store = safeLocalStorage()
  if (!store) return
  writeIndex(
    store,
    readRecent().filter((entry) => entry.repoUrl !== repoUrl),
  )
  try {
    store.removeItem(payloadKey(repoUrl))
  } catch {
    /* ignore */
  }
}
