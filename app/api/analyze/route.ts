import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase'
import {
  consumeTrial,
  trialCookieValue,
  TRIAL_COOKIE_OPTIONS,
  FREE_TRIAL_LIMIT,
  PRO_TRIAL_LIMIT,
} from '@/lib/trial'
import { runAnalysis } from '@/lib/analyze-pipeline'
import { rateLimitIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Browser endpoint. Returns a Server-Sent-Events stream so the homepage can
 * show *real* stage progress (fetch → scan → generate → enhance → score)
 * instead of a decorative loop. The body shape for the final `done` event is
 * unchanged from the old JSON response, so the frontend only changes how it
 * reads it.
 *
 *   POST /api/analyze
 *   body: { repoUrl, userToken?, plan?, githubToken? }
 *
 * Errors that happen before streaming starts (rate limit, missing url, trial
 * exhausted, bad auth) still return a plain JSON error so the client can read
 * it without an event parser.
 */
export async function POST(request: Request) {
  // Best-effort IP rate limit to blunt anonymous abuse. The cookie trial is the
  // real gate; pair with supabase/api_key_rate_buckets.sql for the API limit.
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('cf-connecting-ip') ||
    null
  const ipLimit = rateLimitIp(clientIp)
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests, please try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) },
      }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const repoUrl: string | undefined = body?.repoUrl
  const userToken: string | null | undefined = body?.userToken
  // The GitHub OAuth token (from Supabase provider_token) is what actually
  // unlocks private repositories. It is intentionally separate from
  // userToken, which is the Supabase JWT used only to verify the plan.
  const githubToken: string | null | undefined = body?.githubToken

  if (!repoUrl) {
    return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 })
  }

  // ---- 订阅 / 试用 门控 ----
  // 1) 若携带登录 token，校验是否已是付费用户（Pro / Team）
  let isPaid = false
  let userId: string | null = null
  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const sbAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (userToken && sbUrl && sbAnon) {
    try {
      const sb = createClient(sbUrl, sbAnon)
      const { data: authData } = await sb.auth.getUser(userToken)
      if (authData.user) {
        userId = authData.user.id
        const admin = createAdminClient()
        if (admin) {
          const { data: profile } = await admin
            .from('profiles')
            .select('plan')
            .eq('id', userId)
            .maybeSingle()
          isPaid =
            profile?.plan === 'pro' ||
            profile?.plan === 'team' ||
            profile?.plan === 'lifetime'
        }
      }
    } catch {
      // 校验失败则按匿名试用处理
    }
  }

  // 匿名用户走 cookie 试用（每月 4 次免费 + 2 次 Pro 试用），无需登录。
  const consumeDecision = consumeTrial(request, isPaid)
  if (!consumeDecision.ok) {
    return NextResponse.json(
      {
        error:
          'Your free analyses this month are used up. Subscribe to Pro to keep using the premium model.',
        code: 'TRIAL_EXHAUSTED',
      },
      { status: 402 }
    )
  }
  const usePaidModel = consumeDecision.usePaidModel
  const nextTrial = consumeDecision.state

  // ---- 流式返回真实阶段进度 ----
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      try {
        send({ type: 'progress', stage: 'Starting analysis…', progress: 4 })
        const result = await runAnalysis({
          repoUrl,
          githubToken: githubToken ?? null,
          isPaid,
          usePaidModel,
          onProgress: (stage, pct) => send({ type: 'progress', stage, progress: pct }),
        })

        // 持久化分析历史（仅登录用户；失败不影响本次返回）
        if (userId) {
          try {
            const admin = createAdminClient()
            if (admin) {
              await admin.from('analyses').insert({
                user_id: userId,
                repo_url: result.repo.url,
                repo_name: result.repo.fullName,
                quality_score: result.quality.score,
                agents_md: result.agentsMd,
              })
            }
          } catch (err) {
            console.error('Failed to persist analysis history:', err)
          }
        }

        const payload = {
          ...result,
          isPaid,
          freeTrialLimit: FREE_TRIAL_LIMIT,
          freeTrialRemaining: nextTrial.freeRemaining,
          proTrialLimit: PRO_TRIAL_LIMIT,
          proTrialRemaining: nextTrial.proRemaining,
          trialExhausted: !isPaid && nextTrial.proExhausted,
        }
        send({ type: 'done', result: payload, progress: 100 })
      } catch (err: any) {
        const message = err?.message || 'Failed to analyze repository'
        // Surface the right hint for private-repo auth failures so the UI can
        // prompt the user to connect GitHub.
        const code =
          typeof message === 'string' &&
          (message.includes('sign in with GitHub') ||
            message.includes('reconnect your account') ||
            message.includes("don't have access"))
            ? 'AUTH_REQUIRED'
            : undefined
        send({ type: 'error', error: message, code })
      } finally {
        controller.close()
      }
    },
  })

  const res = new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })

  if (!isPaid) {
    const value = trialCookieValue(nextTrial.freeUsed, nextTrial.proUsed, nextTrial.month)
    res.headers.append(
      'Set-Cookie',
      `rc_trial=${encodeURIComponent(value)}; Path=${TRIAL_COOKIE_OPTIONS.path}; Max-Age=${TRIAL_COOKIE_OPTIONS.maxAge}; SameSite=${TRIAL_COOKIE_OPTIONS.sameSite}`
    )
  }

  return res
}
