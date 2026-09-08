import { NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase"

export const runtime = "nodejs"

// Creem webhook — verify the signature, then sync subscription state.
// Configure the endpoint in Dashboard → Developers → Webhooks:
//   https://your-domain.com/api/creem/webhook
//
// The webhook secret is environment-specific (Test vs Live), so make sure
// CREEM_WEBHOOK_SECRET matches the mode you are currently running in.

type CreemObj = Record<string, any>

function extractEmail(obj: CreemObj): string | undefined {
  const c = obj?.customer
  if (c && typeof c === "object" && c.email) return c.email
  if (obj?.customer_email) return obj.customer_email
  if (obj?.metadata?.email) return obj.metadata.email
  if (obj?.order?.customer?.email) return obj.order.customer.email
  return undefined
}

// The one-time plan is sold as Pro on the pricing page, so both the monthly
// and one-time products map to the "pro" plan in the database.
function extractPlan(obj: CreemObj): "pro" {
  return "pro"
}

function extractCustomerId(obj: CreemObj): string | undefined {
  const c = obj?.customer
  if (typeof c === "string") return c
  if (c && typeof c === "object" && c.id) return c.id
  return obj?.customer_id
}

function extractSubscriptionId(obj: CreemObj): string | undefined {
  if (obj?.subscription_id) return obj.subscription_id
  if (obj?.subscription && typeof obj.subscription === "object") {
    if (obj.subscription.id) return obj.subscription.id
  }
  return obj?.id || obj?.metadata?.subscription_id
}

export async function POST(request: Request) {
  // Trim whitespace/newlines in case the secret was pasted with a trailing
  // newline when set via CLI piping.
  const secret = process.env.CREEM_WEBHOOK_SECRET?.trim()
  const body = await request.text()
  const signature = request.headers.get("creem-signature")

  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 400 }
    )
  }

  // Creem signs the raw request body with HMAC-SHA256 using the webhook
  // secret exactly as shown in Dashboard → Developers → Webhooks.
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")

  if (
    Buffer.from(signature).length !== Buffer.from(expected).length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    console.error("[creem webhook] signature mismatch")
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  let event: { eventType?: string; object?: CreemObj }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  try {
    const type = event.eventType
    const obj = event.object || {}

    // Identify the Supabase user. Prefer the user id we attached to the
    // checkout metadata — it always points at the right account. Fall back to
    // matching the email Creem captured at checkout.
    const resolveUserId = async (email?: string) => {
      const metaUserId = obj?.metadata?.user_id as string | undefined
      if (metaUserId) return metaUserId
      if (!email) return undefined
      const admin = createAdminClient()
      if (!admin) return undefined
      const { data } = await admin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle()
      return data?.id as string | undefined
    }

    const upgrade = async (plan: "pro") => {
      const email = extractEmail(obj)
      const customerId = extractCustomerId(obj)
      const subscriptionId = extractSubscriptionId(obj)
      const userId = await resolveUserId(email)
      if (!userId) {
        console.warn(`[creem webhook] no Supabase user for email ${email}`)
        return
      }
      const admin = createAdminClient()
      if (!admin) return

      // Base payload only uses columns that always exist. Creem ids are
      // written when the optional columns are present; otherwise we retry
      // without them so the upgrade still succeeds.
      const metaUserId = obj?.metadata?.user_id as string | undefined

      const base: Record<string, any> = {
        id: userId,
        plan,
        updated_at: new Date().toISOString(),
      }

      // Only overwrite the stored email when the account was matched by email.
      // When we resolved via metadata, keep the canonical account email.
      if (!metaUserId && email) {
        base.email = email
      }

      let { error } = await admin.from("profiles").upsert(
        {
          ...base,
          ...(customerId ? { creem_customer_id: customerId } : {}),
          ...(subscriptionId ? { creem_subscription_id: subscriptionId } : {}),
        },
        { onConflict: "id" }
      )

      if (error) {
        console.warn(
          "[creem webhook] retrying without optional columns:",
          error.message
        )
        const retry = await admin
          .from("profiles")
          .upsert(base, { onConflict: "id" })
        error = retry.error
      }

      if (error) {
        console.error("[creem webhook] failed to upgrade user:", error)
        throw new Error(`Database error: ${error.message}`)
      }
      console.log(
        `[creem webhook] ${email} (${userId}) upgraded to ${plan}` +
          (customerId ? ` customer=${customerId}` : "") +
          (subscriptionId ? ` subscription=${subscriptionId}` : "")
      )
    }

    const downgrade = async () => {
      const email = extractEmail(obj)
      const userId = await resolveUserId(email)
      if (!userId) return
      const admin = createAdminClient()
      if (!admin) return
      const { error } = await admin
        .from("profiles")
        .update({ plan: "free", updated_at: new Date().toISOString() })
        .eq("id", userId)
      if (error) {
        console.error("[creem webhook] failed to downgrade user:", error)
        throw new Error(`Database error: ${error.message}`)
      }
      console.log(`[creem webhook] ${email} downgraded to free`)
    }

    switch (type) {
      case "subscription.paid":
      case "subscription.active":
      case "checkout.completed":
        await upgrade(extractPlan(obj))
        break

      case "subscription.canceled":
      case "subscription.expired":
      case "subscription.past_due":
      case "subscription.unpaid":
        await downgrade()
        break

      default:
        console.log(`[creem webhook] unhandled event: ${type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Creem webhook error:", err)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }
}
