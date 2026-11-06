"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  PROJECTS,
  type HardwareProject,
} from "@/lib/forge-data"

const STARS_KEY = "rc_hw_stars_v1"

// Curated showcase projects live in lib/forge-data.ts (client-side, always
// shown). Community submissions come from /api/forge and are merged in. Stars
// on DB-backed projects are server-side; the localStorage fallback below is
// only for the static showcase content.

function loadLocalStars(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STARS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

export function useForge() {
  const [hydrated, setHydrated] = useState(false)
  const [serverProjects, setServerProjects] = useState<HardwareProject[]>([])
  const [localStars, setLocalStars] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    setLocalStars(loadLocalStars())
    ;(async () => {
      try {
        const res = await fetch("/api/forge")
        const data = await res.json().catch(() => ({}))
        if (!cancelled && Array.isArray(data?.projects)) {
          setServerProjects(data.projects as HardwareProject[])
        }
      } catch {
        // Offline / not configured — the static showcase still renders.
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Newest community submissions first, then the curated showcase.
  const projects = useMemo(
    () => [...serverProjects, ...PROJECTS],
    [serverProjects],
  )

  const isStarred = useCallback(
    (slug: string) => {
      const sp = serverProjects.find((p) => p.slug === slug)
      if (sp) return Boolean(sp.starredByMe)
      return Boolean(localStars[slug])
    },
    [serverProjects, localStars],
  )

  const star = useCallback(
    async (slug: string) => {
      const sp = serverProjects.find((p) => p.slug === slug)
      // DB-backed project: optimistic update, then sync with the server.
      if (sp?.id) {
        const turningOn = !sp.starredByMe
        setServerProjects((prev) =>
          prev.map((p) =>
            p.slug === slug
              ? {
                  ...p,
                  starredByMe: turningOn,
                  stars: Math.max(0, p.stars + (turningOn ? 1 : -1)),
                }
              : p,
          ),
        )
        try {
          const res = await fetch("/api/forge/star", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          })
          const d = await res.json().catch(() => ({}))
          if (res.ok && typeof d.stars === "number") {
            setServerProjects((prev) =>
              prev.map((p) =>
                p.slug === slug
                  ? { ...p, stars: d.stars, starredByMe: d.starred }
                  : p,
              ),
            )
          }
        } catch {
          /* keep optimistic state */
        }
        return
      }
      // Static showcase fallback (local only).
      setLocalStars((prev) => {
        const next = { ...prev }
        if (next[slug]) delete next[slug]
        else next[slug] = true
        try {
          window.localStorage.setItem(STARS_KEY, JSON.stringify(next))
        } catch {
          /* ignore */
        }
        return next
      })
    },
    [serverProjects],
  )

  const addProject = useCallback(
    async (project: HardwareProject): Promise<string> => {
      try {
        const res = await fetch("/api/forge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project }),
        })
        const d = await res.json().catch(() => ({}))
        if (res.ok && d?.project?.slug) {
          setServerProjects((prev) => [d.project as HardwareProject, ...prev])
          return d.project.slug as string
        }
      } catch {
        /* fall through to local slug */
      }
      return project.slug
    },
    [],
  )

  return { projects, hydrated, isStarred, star, addProject }
}
