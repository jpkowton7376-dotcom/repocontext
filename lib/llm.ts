import OpenAI from "openai"
import type { RepoFacts } from "./scanner"

// 用 LLM 优化 AGENTS.md 的质量
// 输入：模板生成的基础版 + 扫描到的结构化事实
// 输出：更自然、更专业、更简洁的版本
export async function enhanceWithLLM(
  templateMd: string,
  facts: RepoFacts
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

  if (!apiKey) {
    // 没有 API Key 就直接返回模板版
    return templateMd
  }

  const openai = new OpenAI({ apiKey })

  const factsSummary = JSON.stringify(
    {
      repo: `${facts.owner}/${facts.repo}`,
      description: facts.description,
      language: facts.language,
      framework: facts.framework,
      packageManager: facts.packageManager,
      buildTool: facts.buildTool,
      testFramework: facts.testFramework,
      devCommand: facts.devCommand,
      buildCommand: facts.buildCommand,
      testCommand: facts.testCommand,
      lintCommand: facts.lintCommand,
      srcDir: facts.srcDir,
      testDir: facts.testDir,
      hasDocker: facts.hasDocker,
      hasCi: facts.hasCi,
    },
    null,
    2
  )

  const systemPrompt = `You are an expert at writing AGENTS.md files for AI coding agents.
AGENTS.md is a file that gives AI agents context about how to work with a codebase.
Your job is to take a template-generated AGENTS.md and make it better.

Rules:
- Keep it concise (aim for 30-150 lines total)
- Only include information that is VERIFIED from the facts. DO NOT invent or guess anything.
- Use clear, actionable language that an AI agent can follow
- Use proper Markdown formatting
- Include code blocks for all commands
- Group related information under clear headings
- Do NOT include generic advice that applies to every project
- Focus on what makes THIS project specific

Output ONLY the improved AGENTS.md content, nothing else.`

  const userPrompt = `Here are the VERIFIED facts about this repository:

\`\`\`json
${factsSummary}
\`\`\`

Here is a template-generated AGENTS.md to improve:

\`\`\`markdown
${templateMd}
\`\`\`

Please rewrite this into a high-quality, concise AGENTS.md that follows the AGENTS.md convention.
Only use verified facts. Do not invent anything.
Keep it between 30-150 lines.`

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const content = response.choices[0]?.message?.content
    if (content) {
      // 去掉可能包裹的 ```markdown 代码块
      let cleaned = content.trim()
      if (cleaned.startsWith("```markdown")) {
        cleaned = cleaned.replace(/^```markdown\n/, "").replace(/\n```$/, "")
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\n/, "").replace(/\n```$/, "")
      }
      return cleaned
    }
    return templateMd
  } catch (err) {
    console.error("LLM enhancement failed:", err)
    return templateMd
  }
}
