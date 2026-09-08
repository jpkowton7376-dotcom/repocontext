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
