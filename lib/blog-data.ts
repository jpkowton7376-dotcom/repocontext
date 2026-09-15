export interface BlogPost {
  slug: string
  title: string
  date: string
  excerpt: string
  /** Plain HTML body — rendered with dangerouslySetInnerHTML. */
  body: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-write-agents-md",
    title: "How to write an AGENTS.md that actually helps your AI coding agent",
    date: "2026-09-15",
    excerpt:
      "A practical guide to writing AGENTS.md, CLAUDE.md, and Cursor rules that AI agents can act on — based on what RepoContext scans from real repositories.",
    body: `
<p>AI coding agents are only as good as the context you give them. An <strong>AGENTS.md</strong> file is the fastest way to teach an agent how your codebase actually works — but most teams either skip it or write one that reads like a README.</p>

<h2>What an AGENTS.md should contain</h2>
<ul>
  <li><strong>Tech stack</strong> — language, framework, package manager, build tool.</li>
  <li><strong>Commands</strong> — how to install, run, test, and lint.</li>
  <li><strong>Project structure</strong> — where source and tests live.</li>
  <li><strong>Conventions</strong> — the load-bearing rules an agent would otherwise get wrong.</li>
</ul>

<h2>AGENTS.md vs CLAUDE.md vs Cursor Rules</h2>
<p>They describe the same idea in slightly different shapes. <strong>AGENTS.md</strong> is the open, cross-tool standard. <strong>CLAUDE.md</strong> is Anthropic's variant for Claude. <strong>Cursor Rules</strong> (<code>.cursorrules</code>) is Cursor IDE's format. RepoContext can emit all three from one scan so they never drift apart.</p>

<h2>Keep it honest and current</h2>
<p>Every statement should be <em>verified</em> against the repository, not copied from a blog post. The moment code changes, the file decays — regenerate it after refactors, not just at project start.</p>

<p>Want one generated from your own repo in seconds? <a href="/">Try RepoContext</a>.</p>
`,
  },
  {
    slug: "agents-md-vs-claude-md-vs-cursor-rules",
    title: "AGENTS.md vs CLAUDE.md vs Cursor Rules: which context file should you use?",
    date: "2026-09-15",
    excerpt:
      "The three major AI context file formats compared — what they share, where they differ, and how to keep them in sync.",
    body: `
<p>If you use more than one AI coding tool, you have probably seen <strong>AGENTS.md</strong>, <strong>CLAUDE.md</strong>, and <strong>Cursor Rules</strong> and wondered whether you need all three.</p>

<h2>The short answer</h2>
<p>Use <strong>AGENTS.md</strong> as your canonical file — it is the emerging open standard. Mirror it into <strong>CLAUDE.md</strong> and <strong>.cursorrules</strong> for tools that expect their own format. The content is the same; only the filename differs.</p>

<h2>Why keep them in sync</h2>
<p>Drift is the real risk. When your Cursor rules say one thing and your CLAUDE.md says another, the agent picks the wrong convention. Generate all three from a single source so they never disagree.</p>

<p>RepoContext scans your repository and produces all three formats at once. <a href="/">Generate yours</a>.</p>
`,
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
