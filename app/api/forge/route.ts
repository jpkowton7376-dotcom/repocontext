import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-server"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"
import type { HardwareProject } from "@/lib/forge-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Maps a forge_projects row to the client-side HardwareProject shape. */
function rowToProject(row: any, starredByMe = false): HardwareProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    author: row.author,
    avatarColor: row.avatar_color,
    cover: row.cover,
    createdAt: row.created_at,
    tags: Array.isArray(row.tags) ? row.tags : [],
    summary: row.summary ?? "",
    parts: Array.isArray(row.parts) ? row.parts : [],
    wiring: row.wiring ?? "",
    mech: row.mech ?? undefined,
    instructions: Array.isArray(row.instructions) ? row.instructions : [],
    build: row.build ?? undefined,
    stars: row.stars ?? 0,
    featured: row.featured ?? false,
    starredByMe,
  }
}

/**
 * GET /api/forge — list community submissions (newest first), each annotated
 * with whether the caller has starred it. Readable without auth.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ projects: [] })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ projects: [] })
  }

  const { data, error } = await admin
    .from("forge_projects")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500)
  if (error) {
    return NextResponse.json({ projects: [] })
  }

  const user = await getCurrentUser()
  let starredSlugs: Set<string> = new Set()
  if (user && data?.length) {
    const { data: starRows } = await admin
      .from("forge_stars")
      .select("project_id")
      .eq("user_id", user.id)
    if (starRows) {
      const ids = starRows.map((r) => r.project_id)
      const idToSlug = new Map((data as any[]).map((r) => [r.id, r.slug]))
      starredSlugs = new Set(
        ids.map((id) => idToSlug.get(id)).filter(Boolean) as string[],
      )
    }
  }

  const projects = (data ?? []).map((row) =>
    rowToProject(row, starredSlugs.has(row.slug)),
  )
  return NextResponse.json({ projects })
}

/**
 * POST /api/forge — submit a new community project. Requires sign-in.
 * Body: { project: HardwareProject }
 */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Sign in to share a project" }, { status: 401 })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 })
  }

  const p = body?.project
  if (!p || typeof p.slug !== "string" || typeof p.title !== "string") {
    return NextResponse.json({ error: "invalid project" }, { status: 400 })
  }

  const slug = String(p.slug).slice(0, 80)
  const title = String(p.title).slice(0, 160)
  const author = typeof p.author === "string" ? p.author.slice(0, 60) : "anonymous"
  const summary = typeof p.summary === "string" ? p.summary.slice(0, 600) : ""
  const cover = typeof p.cover === "string" ? p.cover.slice(0, 200) : "/projects/plant-monitor.jpg"
  const avatarColor = typeof p.avatarColor === "string" ? p.avatarColor.slice(0, 20) : "#0f172a"
  const wiring = typeof p.wiring === "string" ? p.wiring.slice(0, 4000) : ""
  const mech = typeof p.mech === "string" ? p.mech.slice(0, 4000) : null
  const tags = Array.isArray(p.tags) ? p.tags.map(String).slice(0, 12) : []
  const instructions = Array.isArray(p.instructions)
    ? p.instructions.map(String).slice(0, 100)
    : []
  const parts = Array.isArray(p.parts) ? p.parts.slice(0, 200) : []
  const build = p.build && typeof p.build === "object" ? p.build : null

  // Ensure a unique slug — collisions append a short suffix.
  let finalSlug = slug || `project-${Date.now()}`
  const { data: existing } = await admin
    .from("forge_projects")
    .select("slug")
    .eq("slug", finalSlug)
    .maybeSingle()
  if (existing) {
    finalSlug = `${finalSlug}-${Math.random().toString(36).slice(2, 7)}`
  }

  const { data, error } = await admin
    .from("forge_projects")
    .insert({
      slug: finalSlug,
      title,
      author,
      avatar_color: avatarColor,
      cover,
      summary,
      tags,
      instructions,
      parts,
      wiring,
      mech,
      build,
      user_id: user.id,
    })
    .select("*")
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "insert failed" }, { status: 500 })
  }

  return NextResponse.json({ project: rowToProject(data) }, { status: 201 })
}
