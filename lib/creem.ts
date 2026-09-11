// Strip a possible BOM (U+FEFF) that can sneak in when env vars are copied.
// It breaks HTTP headers (ByteString) and Creem calls if left in place.
const clean = (v?: string) => (v || "").replace(/\uFEFF/g, "")

// Creem payment configuration (Merchant of Record — no company required)
const apiKey = clean(process.env.CREEM_API_KEY)
const testMode = clean(process.env.CREEM_TEST_MODE) === "true"

export const creemConfig = {
  apiKey,
  testMode,
  baseUrl: testMode ? "https://test-api.creem.io/v1" : "https://api.creem.io/v1",
}

// Product IDs created in the Creem dashboard (Products → Add product)
// NOTE: the price charged is whatever you set for this product in the Creem
// dashboard — it is NOT defined in code.
// - Pro: $19/month subscription
// - team (sold as Pro annual on the pricing page): $149/year recurring subscription
// - lifetime (sold as one-time buyout on the pricing page): $299 one-time purchase
export const PRODUCTS = {
  pro: process.env.CREEM_PRODUCT_PRO || "prod_xxx",
  team: process.env.CREEM_PRODUCT_TEAM || "prod_xxx",
  lifetime: process.env.CREEM_PRODUCT_LIFETIME || "prod_xxx",
}

/**
 * Asks Creem to issue a one-time magic link into the hosted Customer
 * Portal for a previously-created customer. From there the user can
 * cancel, update payment method, view invoices, etc.
 *
 * Creem docs: POST /v1/customers/billing  { customer_id }  →
 *             { customer_portal_link: "https://creem.io/my-orders/login/…" }
 */
export async function createCustomerPortal(
  customerId: string,
): Promise<{ url: string } | { error: string }> {
  if (!apiKey) {
    return { error: "Creem API key is not configured" }
  }
  if (!customerId) {
    return { error: "customer_id is required" }
  }

  try {
    const res = await fetch(`${creemConfig.baseUrl}/customers/billing`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customer_id: customerId }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error("Creem customer portal error:", res.status, text)
      return { error: `Creem returned ${res.status}` }
    }

    const data = (await res.json()) as { customer_portal_link?: string }
    if (!data?.customer_portal_link) {
      return { error: "Creem did not return a portal link" }
    }
    return { url: data.customer_portal_link }
  } catch (err: any) {
    console.error("Creem customer portal request failed:", err)
    return { error: err?.message || "Failed to reach Creem" }
  }
}
