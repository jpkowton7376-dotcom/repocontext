import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase"
import { revokeApiKey } from "@/lib/api-keys"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Revokes an API key. Idempotent: calling twice is a no-op (the second
 * call still returns 200, since the key is already revoked). The route
 * checks ownership before touching the database.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 })
  }
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "Missing key id" }, { status: 400 })
  }

  const result = await revokeApiKey(admin, id, user.id)
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Failed to revoke" }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}