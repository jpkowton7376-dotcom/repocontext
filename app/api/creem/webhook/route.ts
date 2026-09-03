import { NextResponse } from "next/server"
import crypto from "crypto"
import { creemConfig } from "@/lib/creem"

export const runtime = "nodejs"

// Creem webhook — verify the signature, then sync subscription state.
// Configure the endpoint in Dashboard → Developers → Webhooks:
//   https://your-domain.com/api/creem/webhook
export async function POST(request: Request) {
  const secret = process.env.CREEM_WEBHOOK_SECRET
  const body = await request.text()
  const signature = request.headers.get("creem-signature")

  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 400 }
    )
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")

  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    const event = JSON.parse(body)
    switch (event.eventType) {
      case "subscription.paid":
      case "checkout.completed":
        // Payment succeeded → upgrade the user's plan.
        // e.g. look up event.object.metadata.plan / customer email in Supabase.
        console.log("Creem payment success:", event.object)
        break

      case "subscription.canceled":
      case "subscription.expired":
      case "subscription.past_due":
      case "subscription.unpaid":
        // Subscription ended → downgrade the user.
        console.log("Creem subscription ended:", event.object)
        break

      default:
        console.log(`Unhandled Creem event: ${event.eventType}`)
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
