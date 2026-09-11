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

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Browser endpoint. The body shape is unchanged so existing frontend
 * code does not need any updates.
 *
 *   POST /api/analyze
 *   body: { repoUrl, userToken?, plan? }
 *
 * The full pipeline has been extracted into lib/analyze-pipeline so the
 * public API endpoint (POST /api/v1/analyze) can share the same code.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const repoUrl: string | undefined = body?.repoUrl
    const userToken: string | null | undefined = body?.userToken

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
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
            isPaid = profile?.plan === 'pro' || profile?.plan === 'team'
          }
        }
      } catch {
        // 校验失败则按匿名试用处理
      }
    }

    // 1) 匿名 / 未付费用户的 cookie 试用计数（每月 5 次免费 + 2 次 Pro 试用）
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

    // 2) 执行分析管线
    const result = await runAnalysis({
      repoUrl,
      githubToken: userToken ?? null,
      isPaid,
      usePaidModel,
    })

    // 3) 持久化分析历史（仅登录用户；失败不影响本次返回）
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

    const res = NextResponse.json({
      ...result,
      // 试用 / 订阅状态
      isPaid,
      freeTrialLimit: FREE_TRIAL_LIMIT,
      freeTrialRemaining: nextTrial.freeRemaining,
      proTrialLimit: PRO_TRIAL_LIMIT,
      proTrialRemaining: nextTrial.proRemaining,
      trialExhausted: !isPaid && nextTrial.proExhausted,
    })

    if (!isPaid) {
      res.cookies.set(
        'rc_trial',
        trialCookieValue(nextTrial.freeUsed, nextTrial.proUsed, nextTrial.month),
        TRIAL_COOKIE_OPTIONS
      )
    }

    return res
  } catch (err: any) {
    console.error('Analysis error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to analyze repository' },
      { status: 500 }
    )
  }
}