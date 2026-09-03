import { NextResponse } from "next/server"
import { parseGithubUrl, getRepoInfo, getRepoStats } from "@/lib/github"
import { scanRepository } from "@/lib/scanner"
import {
  generateAgentsMdTemplate,
  generateClaudeMd,
  generateCursorRules,
  generateCopilotInstructions,
  calculateQualityScore,
  auditAgentsMd,
  buildEvidence,
} from "@/lib/generator"
import { enhanceWithLLM } from "@/lib/llm"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const repoUrl: string | undefined = body?.repoUrl
    const userToken: string | null | undefined = body?.userToken

    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository URL is required" },
        { status: 400 }
      )
    }

    // 1. 解析 GitHub URL
    const { owner, repo } = parseGithubUrl(repoUrl)

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
      agentsMd = await enhanceWithLLM(baseAgentsMd, facts)
    }

    // 6. 计算质量分 + 审计现有 AGENTS.md + 构建证据列表（带 GitHub 跳转链接）
    const quality = calculateQualityScore(facts)
    const audit = auditAgentsMd(facts)
    const evidence = buildEvidence(facts, repoInfo.html_url)

    return NextResponse.json({
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
      // 4 种导出格式
      formats: {
        agentsMd,
        claudeMd,
        cursorRules,
        copilotInstructions,
      },
      // 向后兼容（保留顶层字段，老调用方不需要改）
      agentsMd,
      // 质量 + 审计 + 证据
      quality,
      audit,
      evidence,
      // 现有 AGENTS.md 原文，用于「现有 vs 生成」并排对比
      existingAgentsMd: facts.agentsMdContent,
      usedLLM,
      hasExistingAgentsMd: facts.hasAgentsMd,
    })
  } catch (err: any) {
    console.error("Analysis error:", err)
    return NextResponse.json(
      { error: err.message || "Failed to analyze repository" },
      { status: 500 }
    )
  }
}