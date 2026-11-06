import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-server"
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/forge/star — toggle the caller's star on a project (by slug).
 * Returns the updated { stars, starred }. Requires sign-in.
 *
 * Body: { slug: string }
 */
export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Sign in to star" }, { status: 401 })
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
  const slug = typeof body?.slug === "string" ? body.slug.trim() : ""
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 })
  }

  const { data: project, error: findErr } = await admin
    .from("forge_projects")
    .select("id, stars")
    .eq("slug", slug)
    .maybeSingle()
  if (findErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }
  const projectId: string = project.id

  // Toggle: remove existing star, else add one.
  const { data: existingStar } = await admin
    .from("forge_stars")
    .select("id")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle()

  let starred: boolean
  if (existingStar) {
    await admin.from("forge_stars").delete().eq("id", existingStar.id)
    starred = false
  } else {
    await admin
      .from("forge_stars")
      .insert({ project_id: projectId, user_id: user.id })
    starred = true
  }

  // Recompute the count from the stars table (source of truth) and persist it.
  const { count } = await admin
    .from("forge_stars")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
  const stars = count ?? 0
  await admin.from("forge_projects").update({ stars }).eq("id", projectId)

  return NextResponse.json({ stars, starred })
}
