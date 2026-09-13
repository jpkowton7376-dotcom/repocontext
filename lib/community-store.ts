"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Project,
  ContextFormat,
  CategoryId,
  SEED_PROJECTS,
  slugify,
} from "./community-data"

const PROJECTS_KEY = "rc_community_projects_v2"
const STARS_KEY = "rc_community_stars_v2"

export interface NewProjectInput {
  title: string
  summary: string
  description: string
  repoUrl?: string
  category: CategoryId
  tags: string[]
  files: { name: string; format: ContextFormat; content: string }[]
  structure: string[]
  instructions: { title: string; items: string[] }[]
  authorName: string
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

function avatarColorFor(name: string): string {
  const palette = ["#0f62fe", "#6929c4", "#009d9a", "#cc6600", "#da1e28", "#198038", "#8a3ffc", "#1192e8"]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return palette[h % palette.length]
}

export function useCommunity() {
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [stars, setStars] = useState<Record<string, boolean>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setUserProjects(load<Project[]>(PROJECTS_KEY, []))
    setStars(load<Record<string, boolean>>(STARS_KEY, {}))
    setHydrated(true)
  }, [])

  const projects = useMemo<Project[]>(() => {
    const merged = [...userProjects, ...SEED_PROJECTS]
    return merged.map((p) => {
      const isStarred = !!stars[p.id]
      return { ...p, stars: p.stars + (isStarred ? 1 : 0) }
    })
  }, [userProjects, stars])

  const getProject = useCallback(
    (slug: string) => projects.find((p) => p.slug === slug),
    [projects],
  )

  const star = useCallback(
    (projectId: string) => {
      if (!hydrated) return
      setStars((prev) => {
        const next = { ...prev }
        if (next[projectId]) delete next[projectId]
        else next[projectId] = true
        save(STARS_KEY, next)
        return next
      })
    },
    [hydrated],
  )

  const isStarred = useCallback((projectId: string) => !!stars[projectId], [stars])

  const addProject = useCallback(
    (input: NewProjectInput): string => {
      if (!hydrated) return ""
      const slug = slugify(input.title) || `project-${Date.now()}`
      const project: Project = {
        id: `u-${Date.now()}`,
        slug,
        title: input.title.trim(),
        summary: input.summary.trim(),
        description: input.description.trim(),
        repoUrl: input.repoUrl?.trim() || undefined,
        author: {
          name: input.authorName.trim() || "Anonymous",
          handle: input.authorName.trim().toLowerCase().replace(/\s+/g, "") || "anon",
          avatarColor: avatarColorFor(input.authorName || "Anonymous"),
        },
        category: input.category,
        tags: input.tags,
        formats: input.files.map((f) => f.format),
        files: input.files,
        structure: input.structure.length ? input.structure : ["README.md"],
        parts: input.files.map((f) => ({ name: f.name, category: "Context", count: 1 })),
        instructions: input.instructions.length
          ? input.instructions
          : [{ title: "Use this project", items: ["Copy the files from the Files tab into your repo."] }],
        cover: "/templates/sample-typescript.jpg",
        stars: 1,
        createdAt: Date.now(),
      }
      setUserProjects((prev) => {
        const next = [project, ...prev]
        save(PROJECTS_KEY, next)
        return next
      })
      setStars((prev) => {
        const next = { ...prev, [project.id]: true }
        save(STARS_KEY, next)
        return next
      })
      return slug
    },
    [hydrated],
  )

  return {
    hydrated,
    projects,
    getProject,
    star,
    isStarred,
    addProject,
  }
}

export type SortKeyAlias = import("./community-data").SortKey
