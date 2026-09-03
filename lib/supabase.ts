import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 如果没配置 Supabase，返回 null，页面自己处理未配置的情况
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// 检查 Supabase 是否已配置
export function isSupabaseConfigured(): boolean {
  return !!supabase
}

// 服务端用的 admin client（需要 service_role key）
export function createAdminClient() {
  if (!supabaseUrl) return null
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return null
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
