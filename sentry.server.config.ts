// Sentry server-side init.
// Set SENTRY_DSN in your environment to enable error reporting on the
// Next.js server (API routes, Server Components, route handlers).
// When the DSN is missing, Sentry silently no-ops.
import * as Sentry from "@sentry/nextjs"

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // Don't capture health-check / favicon noise.
    ignoreTransactions: [/\/favicon\.ico/, /\/_next\//],
    beforeSend(event) {
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url)
          event.request.url = `${u.origin}${u.pathname}`
        } catch {
          // ignore
        }
      }
      return event
    },
  })
}
