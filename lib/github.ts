// 从 GitHub URL 中提取 owner 和 repo
export function parseGithubUrl(url: string): { owner: string; repo: string } {
  // 支持以下格式:
  // https://github.com/owner/repo
  // github.com/owner/repo
  // owner/repo
  let cleaned = url.trim()
  cleaned = cleaned.replace(/^https?:\/\//, "")
  cleaned = cleaned.replace(/^github\.com\//, "")
  cleaned = cleaned.replace(/\.git$/, "")
  cleaned = cleaned.replace(/\/$/, "")

  const parts = cleaned.split("/")
  if (parts.length < 2) {
    throw new Error(
      "Invalid GitHub URL. Use format: owner/repo or https://github.com/owner/repo"
    )
  }

  return { owner: parts[0], repo: parts[1] }
}

const GITHUB_API = "https://api.github.com"

/**
 * Returns headers for a GitHub API request. A caller-supplied `userToken`
 * (from Supabase GitHub OAuth) takes priority over the server-side
 * `GITHUB_TOKEN`, which is what enables private repository access for the
 * authenticated user.
 */
function getHeaders(userToken?: string | null) {
  const token = userToken || process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoContext",
  }
  if (token) {
    headers["Authorization"] = `token ${token}`
  }
  return headers
}

// 获取仓库基本信息
export async function getRepoInfo(
  owner: string,
  repo: string,
  userToken?: string | null,
) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: getHeaders(userToken),
  })
  if (res.status === 404) {
    throw new Error(
      userToken
        ? "Repository not found or you don't have access. Check the URL and that the OAuth scope includes this repo."
        : "Repository not found. For private repos, sign in with GitHub first.",
    )
  }
  if (res.status === 403) {
    throw new Error(
      "GitHub API rate limit exceeded or token lacks permission. Add GITHUB_TOKEN to .env.local or sign in with GitHub.",
    )
  }
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
  return res.json()
}

// 获取文件树。对超大仓库，递归树（?recursive=1）会被 GitHub 拒绝（返回
// 200 + {message:"Git Repository is too large"} 或截断），此时自动回退到
// 根目录（非递归）树。框架/包管理器检测所需的 package.json、go.mod、
// requirements.txt、pyproject.toml、Cargo.toml 等均在根目录，足够使用。
export async function getRepoTree(
  owner: string,
  repo: string,
  userToken?: string | null,
  recursive = true,
): Promise<{ tree: any[] }> {
  let branch: string
  try {
    const info = await getRepoInfo(owner, repo, userToken)
    branch = info.default_branch || "main"
  } catch {
    branch = "main"
  }

  const fetchTree = async (b: string, rec: boolean) => {
    const url =
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${b}` +
      (rec ? "?recursive=1" : "")
    try {
      const res = await fetch(url, { headers: getHeaders(userToken) })
      if (!res.ok) return null
      const data = await res.json()
      // 超大仓库的递归树会返回 200 但 body 为错误对象（无 tree 数组），需过滤掉
      if (!data || !Array.isArray(data.tree)) return null
      return data
    } catch {
      return null
    }
  }

  let data = await fetchTree(branch, recursive)
  // 递归树失败（仓库过大）时回退到根目录树
  if (!data && recursive) data = await fetchTree(branch, false)
  if (!data && branch !== "main") {
    data =
      (await fetchTree("main", recursive)) ||
      (recursive ? await fetchTree("main", false) : null)
  }
  if (!data) throw new Error("Could not fetch repo tree")
  return data as { tree: any[] }
}

// 获取指定文件内容
export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  userToken?: string | null,
): Promise<string | null> {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    { headers: getHeaders(userToken) },
  )
  if (res.status === 404) return null
  if (!res.ok) return null
  const data = await res.json()
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8")
  }
  return null
}

// 获取仓库 issue / PR 统计（基于 GitHub GraphQL API，失败则回退到 0）
export interface RepoStats {
  totalIssues: number
  openIssues: number
  closedIssues: number
  pullRequests: number
}

export async function getRepoStats(
  owner: string,
  repo: string,
  userToken?: string | null,
): Promise<RepoStats> {
  const token = userToken || process.env.GITHUB_TOKEN
  if (!token) {
    return { totalIssues: 0, openIssues: 0, closedIssues: 0, pullRequests: 0 }
  }

  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        openIssues: issues(states: OPEN) { totalCount }
        closedIssues: issues(states: CLOSED) { totalCount }
        openPRs: pullRequests(states: OPEN) { totalCount }
        mergedPRs: pullRequests(states: MERGED) { totalCount }
        closedPRs: pullRequests(states: CLOSED) { totalCount }
      }
    }
  `

  try {
    const res = await fetch(`${GITHUB_API}/graphql`, {
      method: "POST",
      headers: {
        ...getHeaders(userToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { owner, repo } }),
    })

    if (!res.ok) {
      return { totalIssues: 0, openIssues: 0, closedIssues: 0, pullRequests: 0 }
    }

    const json = await res.json()
    const r = json?.data?.repository
    if (!r) {
      return { totalIssues: 0, openIssues: 0, closedIssues: 0, pullRequests: 0 }
    }

    const openIssues = r.openIssues?.totalCount || 0
    const closedIssues = r.closedIssues?.totalCount || 0
    const pullRequests =
      (r.openPRs?.totalCount || 0) +
      (r.mergedPRs?.totalCount || 0) +
      (r.closedPRs?.totalCount || 0)

    return {
      totalIssues: openIssues + closedIssues,
      openIssues,
      closedIssues,
      pullRequests,
    }
  } catch {
    return { totalIssues: 0, openIssues: 0, closedIssues: 0, pullRequests: 0 }
  }
}

// 判断仓库默认分支
export async function getDefaultBranch(
  owner: string,
  repo: string,
  userToken?: string | null,
): Promise<string> {
  const info = await getRepoInfo(owner, repo, userToken)
  return info.default_branch || "main"
}
