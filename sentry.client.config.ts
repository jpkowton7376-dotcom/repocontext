// Sentry client-side init.
// Set NEXT_PUBLIC_SENTRY_DSN in your environment to enable error reporting.
// When the DSN is missing, Sentry silently no-ops — no impact on users.
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    // Replay is heavy; only record 1% of sessions and on errors.
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.01,
    tracesSampleRate: 0.1,
    // Privacy: never log full URLs (they may contain private repo paths).
    beforeSend(event) {
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url)
          // Keep the path, strip query string (where trial tokens live).
          event.request.url = `${u.origin}${u.pathname}`
        } catch {
          // ignore
        }
      }
      return event
    },
  })
}
