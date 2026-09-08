import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseGithubUrl, getRepoInfo, getRepoStats } from '@/lib/github'
import { scanRepository } from '@/lib/scanner'
import {
  generateAgentsMdTemplate,
  generateClaudeMd,
  generateCursorRules,
  generateCopilotInstructions,
  calculateQualityScore,
  auditAgentsMd,
  buildEvidence,
} from '@/lib/generator'
import { enhanceWithLLM } from '@/lib/llm'
import { createAdminClient } from '@/lib/supabase'
import {
  consumeTrial,
  trialCookieValue,
  TRIAL_COOKIE_OPTIONS,
  FREE_TRIAL_LIMIT,
  PRO_TRIAL_LIMIT,
} from '@/lib/trial'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const repoUrl: string | undefined = body?.repoUrl
    const userToken: string | null | undefined = body?.userToken
    const plan: string | undefined = body?.plan

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    // ---- 订阅 / 试用 门控 ----
    // 1) 若携带登录 token，校验是否已是付费用户（Pro / Team）
    let isPaid = false
    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const sbAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (userToken && sbUrl && sbAnon) {
      try {
        const sb = createClient(sbUrl, sbAnon)
        const { data: authData } = await sb.auth.getUser(userToken)
        if (authData.user) {
          const admin = createAdminClient()
          if (admin) {
            const { data: profile } = await admin
              .from('profiles')
              .select('plan')
              .eq('id', authData.user.id)
              .maybeSingle()
            isPaid = profile?.plan === 'pro' || profile?.plan === 'team'
          }
        }
      } catch {
        // 校验失败则按匿名试用处理
      }
    }

    // 1. 解析 GitHub URL（先校验格式，避免无效输入消耗试用额度）
    const { owner, repo } = parseGithubUrl(repoUrl)

    // 2) 匿名 / 未付费用户的 cookie 试用计数（每月 5 次免费 + 2 次 Pro 试用）
    //    扣减额度并决定使用的模型；额度用尽则直接拦截。
    const consumeDecision = consumeTrial(request, isPaid)
    if (!consumeDecision.ok) {
      return NextResponse.json(
        {
          error:
            'Your free analyses this month are used up. Subscribe to Pro to keep using the premium model.',
          code: 'TRIAL_EXHAUSTED',
        },
        { status: 402 },
      )
    }
    const usePaidModel = consumeDecision.usePaidModel
    const nextTrial = consumeDecision.state

    // 2. 获取仓库基本信息（优先使用调用方传入的 OAuth token，可访问私有仓库）
    const repoInfo = await getRepoInfo(owner, repo, userToken ?? null)

    // 3. 并行获取 issue / PR 统计
    const repoStats = await getRepoStats(owner, repo, userToken ?? null)

    // 4. 扫描仓库，提取结构化事实
    const facts = await scanRepository(owner, repo, repoInfo, userToken ?? null)

    // 4. 用模板生成 4 种导出格式（同一份 RepoFacts 驱动，保证一致性）
    const baseAgentsMd = generateAgentsMdTemplate(facts)
    const claudeMd = generateClaudeMd(facts)
    const cursorRules = generateCursorRules(facts)
    const copilotInstructions = generateCopilotInstructions(facts)

    // 5. 用 LLM 增强（仅增强 AGENTS.md，其它格式保持模板确定性输出）
    let agentsMd = baseAgentsMd
    const usedLLM = !!process.env.OPENAI_API_KEY
    if (usedLLM) {
      // 试用期内或已付费用户使用更强的模型；用尽后降级为基础模型
      agentsMd = await enhanceWithLLM(baseAgentsMd, facts, { paid: usePaidModel })
    }

    // 6. 计算质量分 + 审计现有 AGENTS.md + 构建证据列表（带 GitHub 跳转链接）
    const quality = calculateQualityScore(facts)
    const audit = auditAgentsMd(facts)
    const evidence = buildEvidence(facts, repoInfo.html_url)

    // 试用计数已在请求入口处扣减（付费用户不消耗试用额度）

    const res = NextResponse.json({
      repo: {
        owner,
        repo,
        fullName: `${owner}/${repo}`,
        description: facts.description,
        language: facts.language,
        stars: repoInfo.stargazers_count,
        url: repoInfo.html_url,
        defaultBranch: facts.defaultBranch,
        isPrivate: !!repoInfo.private,
      },
      facts: {
        framework: facts.framework,
        packageManager: facts.packageManager,
        buildTool: facts.buildTool,
        testFramework: facts.testFramework,
        devCommand: facts.devCommand,
        buildCommand: facts.buildCommand,
        testCommand: facts.testCommand,
        lintCommand: facts.lintCommand,
        testDir: facts.testDir,
        srcDir: facts.srcDir,
        hasDocker: facts.hasDocker,
        hasCi: facts.hasCi,
        hasAgentsMd: facts.hasAgentsMd,
        hasReadme: facts.hasReadme,
        isMonorepo: facts.isMonorepo,
        monorepoDirs: facts.monorepoDirs,
        totalIssues: repoStats.totalIssues,
        openIssues: repoStats.openIssues,
        closedIssues: repoStats.closedIssues,
        pullRequests: repoStats.pullRequests,
      },
      formats: {
        agentsMd,
        claudeMd,
        cursorRules,
        copilotInstructions,
      },
      agentsMd,
      quality,
      audit,
      evidence,
      existingAgentsMd: facts.agentsMdContent,
      usedLLM,
      hasExistingAgentsMd: facts.hasAgentsMd,
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
        TRIAL_COOKIE_OPTIONS,
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
