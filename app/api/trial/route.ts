import { NextResponse } from 'next/server'
import { getTrialState, FREE_TRIAL_LIMIT, PRO_TRIAL_LIMIT } from '@/lib/trial'

export const runtime = 'nodejs'

// 返回匿名用户剩余的免费 / Pro 试用次数（均按月重置）
export async function GET(request: Request) {
  const state = getTrialState(request)
  return NextResponse.json({
    freeRemaining: state.freeRemaining,
    freeLimit: FREE_TRIAL_LIMIT,
    proRemaining: state.proRemaining,
    proLimit: PRO_TRIAL_LIMIT,
    month: state.month,
  })
}
