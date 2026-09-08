import { NextResponse } from "next/server"
import { creemConfig, PRODUCTS } from "@/lib/creem"
import { getCurrentUser } from "@/lib/supabase-server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { apiKey, baseUrl } = creemConfig
  const clean = (v?: string | null) => (v || "").replace(/\uFEFF/g, "")
  const siteUrl = clean(process.env.NEXT_PUBLIC_SITE_URL) || "http://localhost:3000"

  // Not configured: in dev, jump straight to the success page so the UI
  // flow can be previewed without a Creem account.
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.redirect(`${siteUrl}/dashboard?success=true&demo=true`, 303)
    }
    return NextResponse.json(
      {
        error:
          "Creem is not configured yet. Add CREEM_API_KEY to your .env.local to enable payments.",
      },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const plan = (formData.get("plan") as string) || "pro"

    const productId = clean(
      plan === "pro"
        ? PRODUCTS.pro
        : plan === "team"
        ? PRODUCTS.team
        : plan === "lifetime"
        ? PRODUCTS.lifetime
        : null
    )

    if (!productId || productId.startsWith("prod_xxx")) {
      return NextResponse.json(
        {
          error:
            "Plan not configured. Set CREEM_PRODUCT_PRO, CREEM_PRODUCT_TEAM and CREEM_PRODUCT_LIFETIME in your environment variables.",
        },
        { status: 500 }
      )
    }

    // The signed-in user is required so the webhook can upgrade exactly this
    // account after payment. Without it we would have to guess by email.
    const user = await getCurrentUser()

    if (!user?.id) {
      return NextResponse.redirect(
        `${siteUrl}/login?next=${encodeURIComponent("/pricing")}`,
        303
      )
    }

    const res = await fetch(`${baseUrl}/checkouts`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId,
        success_url: `${siteUrl}/dashboard?success=true`,
        // Creem echoes this metadata back on every webhook event.
        metadata: {
          plan,
          user_id: user.id,
          email: user.email ?? undefined,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || `Creem checkout failed (${res.status})`)
    }

    const data = await res.json()
    if (!data.checkout_url) {
      throw new Error("Creem did not return a checkout_url")
    }

    return NextResponse.redirect(data.checkout_url, 303)
  } catch (err: any) {
    console.error("Creem checkout error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
