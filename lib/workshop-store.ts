"use client"

import { useCallback, useEffect, useState } from "react"
import {
  PROJECTS,
  type HardwareProject,
} from "@/lib/workshop-data"

const PROJECTS_KEY = "rc_hw_projects_v1"
const STARS_KEY = "rc_hw_stars_v1"

function loadUserProjects(): HardwareProject[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as HardwareProject[]) : []
  } catch {
    return []
  }
}

function loadStars(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STARS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function useWorkshop() {
  const [hydrated, setHydrated] = useState(false)
  const [userProjects, setUserProjects] = useState<HardwareProject[]>([])
  const [stars, setStars] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setUserProjects(loadUserProjects())
    setStars(loadStars())
    setHydrated(true)
  }, [])

  const projects = [...userProjects, ...PROJECTS]

  const isStarred = useCallback(
    (slug: string) => Boolean(stars[slug]),
    [stars],
  )

  const star = useCallback((slug: string, value?: boolean) => {
    setStars((prev) => {
      const next = { ...prev }
      const want = value ?? !prev[slug]
      if (want) next[slug] = true
      else delete next[slug]
      try {
        window.localStorage.setItem(STARS_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  const addProject = useCallback((project: HardwareProject) => {
    setUserProjects((prev) => {
      const next = [project, ...prev]
      try {
        window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  return { projects, hydrated, isStarred, star, addProject }
}
