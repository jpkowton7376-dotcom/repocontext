// Creem payment configuration (Merchant of Record — no company required)
const apiKey = process.env.CREEM_API_KEY
const testMode = process.env.CREEM_TEST_MODE === "true"

export const creemConfig = {
  apiKey,
  testMode,
  baseUrl: testMode ? "https://test-api.creem.io/v1" : "https://api.creem.io/v1",
}

// Product IDs created in the Creem dashboard (Products → Add product)
export const PRODUCTS = {
  pro: process.env.CREEM_PRODUCT_PRO || "prod_xxx",
  team: process.env.CREEM_PRODUCT_TEAM || "prod_xxx",
}

// Daily free analysis limit for non-paying users
export const FREE_DAILY_LIMIT = Number(process.env.FREE_DAILY_LIMIT || 3)
