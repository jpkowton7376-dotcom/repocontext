"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

/**
 * Sends one page-view beacon per route change to /api/track. Uses
 * navigator.sendBeacon when available so tracking never delays navigation or
 * is cancelled by an unload. A ref dedupes repeats (e.g. React strict-mode's
 * double-invoked effects in dev) so a single view isn't counted twice.
 *
 * Renders nothing; mount it once inside the root layout.
 */
export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname

    const payload = JSON.stringify({
      path: pathname,
      referrer:
        typeof document !== "undefined" ? document.referrer.slice(0, 300) : "",
      locale:
        typeof navigator !== "undefined" ? navigator.language.slice(0, 20) : "",
    })

    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track",
          new Blob([payload], { type: "application/json" }),
        )
      } else {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        })
      }
    } catch {
      // Analytics must never break the app — swallow everything.
    }
  }, [pathname])

  return null
}
