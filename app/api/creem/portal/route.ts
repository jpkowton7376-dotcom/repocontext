import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase-server"
import { createAdminClient } from "@/lib/supabase"
import { createCustomerPortal } from "@/lib/creem"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Returns a one-time Creem Customer Portal link for the signed-in user so
 * they can cancel their subscription, update payment method or view
 * invoices without contacting support.
 *
 * Required setup:
 *  - The user must be signed in (Supabase session).
 *  - The webhook from /api/creem/webhook must have written the user's
 *    creem_customer_id into profiles. If that column is missing the user
 *    has not completed a payment yet.
 */
export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to manage your subscription." },
        { status: 401 },
      )
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { error: "Supabase admin client is not configured." },
        { status: 503 },
      )
    }

    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("creem_customer_id, plan")
      .eq("id", user.id)
      .maybeSingle()

    if (profileErr) {
      console.error("portal: failed to load profile", profileErr)
      return NextResponse.json({ error: "Failed to load account" }, { status: 500 })
    }

    const customerId = (profile?.creem_customer_id as string | null) || null
    if (!customerId) {
      return NextResponse.json(
        {
          error:
            "No active subscription found for this account. If you recently paid, please try again in a few seconds.",
        },
        { status: 404 },
      )
    }

    const result = await createCustomerPortal(customerId)
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 502 })
    }

    return NextResponse.json({ url: result.url })
  } catch (err: any) {
    console.error("portal: unexpected error", err)
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 },
    )
  }
}
