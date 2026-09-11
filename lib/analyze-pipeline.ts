/**
 * Core repository analysis pipeline. Called by both the browser
 * endpoint (/api/analyze) and the public API endpoint (/api/v1/analyze)
 * after each one has resolved its own auth and trial context.
 *
 * Keeping this as a pure function (input → result) makes it easy to add
 * a third caller later — e.g. a cron job or a CI worker — without
 * duplicating the LLM / scanner / generator wiring.
 */
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

export interface AnalyzeOptions {
  /** Full https URL or git@ URL of the repo. */
  repoUrl: string
  /** GitHub OAuth token, if the caller can read private repos. */
  githubToken?: string | null
  /** True if the caller is on a paid plan. */
  isPaid: boolean
  /** True if we should use the premium LLM model. */
  usePaidModel: boolean
}

export interface AnalyzeResult {
  repo: {
    owner: string
    repo: string
    fullName: string
    description: string | null
    language: string | null
    stars: number
    url: string
    defaultBranch: string
    isPrivate: boolean
  }
  facts: {
    framework: string | null
    packageManager: string | null
    buildTool: string | null
    testFramework: string | null
    devCommand: string | null
    buildCommand: string | null
    testCommand: string | null
    lintCommand: string | null
    testDir: string | null
    srcDir: string | null
    hasDocker: boolean
    hasCi: boolean
    hasAgentsMd: boolean
    hasReadme: boolean
    isMonorepo: boolean
    monorepoDirs: string[]
    totalIssues: number
    openIssues: number
    closedIssues: number
    pullRequests: number
  }
  formats: {
    agentsMd: string
    claudeMd: string
    cursorRules: string
    copilotInstructions: string
  }
  agentsMd: string
  quality: ReturnType<typeof calculateQualityScore>
  audit: ReturnType<typeof auditAgentsMd>
  evidence: ReturnType<typeof buildEvidence>
  existingAgentsMd: string | null
  usedLLM: boolean
  hasExistingAgentsMd: boolean
}

/**
 * Runs the full analysis for the given repo URL. Throws on any hard
 * failure (bad URL, repo not found, scanner error). The caller is
 * responsible for turning thrown errors into HTTP responses.
 */
export async function runAnalysis(opts: AnalyzeOptions): Promise<AnalyzeResult> {
  const { owner, repo } = parseGithubUrl(opts.repoUrl)

  const repoInfo = await getRepoInfo(owner, repo, opts.githubToken ?? null)
  const repoStats = await getRepoStats(owner, repo, opts.githubToken ?? null)
  const facts = await scanRepository(owner, repo, repoInfo, opts.githubToken ?? null)

  const baseAgentsMd = generateAgentsMdTemplate(facts)
  const claudeMd = generateClaudeMd(facts)
  const cursorRules = generateCursorRules(facts)
  const copilotInstructions = generateCopilotInstructions(facts)

  const usedLLM = !!process.env.OPENAI_API_KEY
  const agentsMd = usedLLM
    ? await enhanceWithLLM(baseAgentsMd, facts, { paid: opts.usePaidModel })
    : baseAgentsMd

  const quality = calculateQualityScore(facts)
  const audit = auditAgentsMd(facts)
  const evidence = buildEvidence(facts, repoInfo.html_url)

  return {
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
  }
}