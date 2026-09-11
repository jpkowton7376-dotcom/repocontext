// Next.js config wrapped with Sentry. The wrapper is a no-op when
// SENTRY_DSN is not set, so this file is safe to keep even before you
// have a Sentry project.
const { withSentryConfig } = require("@sentry/nextjs")

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing project config (kept empty here; extend as needed)
}

module.exports = withSentryConfig(nextConfig, {
  // Suppress the "Sentry CLI not found" build logs when DSN is unset.
  silent: !process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Upload source maps on Vercel builds automatically.
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
})
