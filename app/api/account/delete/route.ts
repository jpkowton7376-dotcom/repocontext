import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Permanently delete the signed-in user's account and all associated
 * data, in compliance with GDPR Art.17 (Right to erasure).
 *
 * Cascading FK constraints take care of `profiles` and `analyses` once
 * the auth user row is removed:
 *   profiles.id  references auth.users(id) on delete cascade
 *   analyses.user_id references auth.users(id) on delete cascade
 *
 * If the user is on a paid plan, we return 409 and ask them to cancel
 * first via the Creem Customer Portal. We never silently kill a
 * paying account.
 *
 * The endpoint expects a JSON body `{ confirm: "DELETE" }` so a stray
 * button press cannot trigger it.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to delete your account." },
        { status: 401 },
      )
    }

    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // empty body is invalid
    }
    if (body?.confirm !== "DELETE") {
      return NextResponse.json(
        {
          error:
            'Confirmation required. Re-send the request with { "confirm": "DELETE" } in the JSON body.',
        },
        { status: 400 },
      )
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { error: "Supabase admin client is not configured." },
        { status: 503 },
      )
    }

    // 1. Refuse to delete a paying account. The user must cancel the
    //    subscription via the Creem Customer Portal first.
    const { data: profile } = await admin
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle()

    if (profile && (profile.plan === "pro" || profile.plan === "team")) {
      return NextResponse.json(
        {
          error:
            "You have an active paid subscription. Please cancel it from the Manage subscription link in your dashboard before deleting your account.",
        },
        { status: 409 },
      )
    }

    // 2. Best-effort cleanup of analyses. Even though the FK cascade
    //    would handle this, doing it explicitly means we can return a
    //    sensible count in logs and tolerate the cascade failing
    //    because of a broken policy.
    const { error: analysesErr } = await admin
      .from("analyses")
      .delete()
      .eq("user_id", user.id)
    if (analysesErr) {
      console.error(
        "account/delete: failed to remove analyses (continuing):",
        analysesErr,
      )
    }

    // 3. Delete the auth user. Cascades to profiles via the FK.
    const { error: authErr } = await admin.auth.admin.deleteUser(user.id)
    if (authErr) {
      console.error("account/delete: failed to delete auth user:", authErr)
      return NextResponse.json(
        {
          error:
            "Failed to delete account. Please try again or contact support.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("account/delete: unexpected error", err)
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 },
    )
  }
}
