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
{
slug: "how-to-use-claude-md-with-private-repos",
title: "How to use CLAUDE.md with private repositories",
date: "2026-09-15",
excerpt:
  "Private repos need a different CLAUDE.md workflow — token access, what not to commit, and how to keep context current without leaking secrets.",
body: `
<p>Most tutorials assume a public repo. With a <strong>private repository</strong>, using <strong>CLAUDE.md</strong> safely takes a few extra steps so you give Claude context without leaking secrets or internal architecture.</p>

<h2>1. Grant the right access</h2>
<p>Claude Code authenticates with a GitHub token. For a private repo, use a token (or GitHub App installation) scoped to that repository — prefer fine-grained tokens over classic ones, and set an expiry.</p>

<h2>2. Keep secrets out of CLAUDE.md</h2>
<p>Never paste API keys, .env contents, or internal endpoints into the context file. Describe <em>where</em> secrets live and <em>how</em> to load them, not their values:</p>
<pre><code># Config
- Load secrets from .env (never committed)
- Auth via GITHUB_TOKEN, injected at runtime</code></pre>

<h2>3. Don't commit it if the repo is shared externally</h2>
<p>If contractors or a public mirror touch the repo, keep CLAUDE.md out of the default branch. You can still generate it locally and drop it in <code>~/.claude/</code> project memory instead.</p>

<h2>4. Regenerate after refactors</h2>
<p>Private codebases change fast. A stale context file is worse than none. <a href="/">Generate a fresh CLAUDE.md from your private repo</a> and re-drop it whenever the structure shifts.</p>
`,
},
{
slug: "keep-agents-md-in-sync-with-codebase",
title: "How to keep AGENTS.md in sync with your codebase (CI automation)",
date: "2026-09-15",
excerpt:
  "AGENTS.md rots the moment code changes. Here is how to regenerate it automatically in CI so your AI agents never read stale context.",
body: `
<p>An <strong>AGENTS.md</strong> is only useful if it matches reality. The fastest way to keep it honest is to stop treating it as a hand-written doc and start treating it as a build artifact.</p>

<h2>Why it rots</h2>
<p>Commands change, directories move, new test runners appear. Within weeks a manutained file is describing a project that no longer exists — and the agent follows instructions that fail.</p>

<h2>Automate regeneration in CI</h2>
<ul>
<li>Add a job that re-scans the repo on every pull request.</li>
<li>Diff the generated AGENTS.md against the committed one.</li>
<li>If they differ, post the update as a PR comment or fail the check so someone commits it.</li>
</ul>

<h2>Make it a gate, not a suggestion</h2>
<p>Wire the check into your merge rules. That way context drift shows up in review, next to the code that caused it.</p>

<p><a href="/">RepoContext</a> generates AGENTS.md from a verified scan — wire it into a scheduled job and your agents always read current context.</p>
`,
},
{
slug: "cursor-rules-best-practices",
title: "Cursor rules best practices: write rules your agent won't ignore",
date: "2026-09-15",
excerpt:
  "Most .cursorrules files are too long or too vague to help. Practical rules for writing Cursor rules that actually change agent behavior.",
body: `
<p><strong>Cursor Rules</strong> (<code>.cursorrules</code>) only work if the agent can follow them. Most teams write a wall of text and wonder why nothing changes.</p>

<h2>Be specific and actionable</h2>
<p>Replace "write clean code" with "run <code>pnpm lint</code> before marking a task done." Agents follow concrete commands far better than adjectives.</p>

<h2>Keep it short</h2>
<p>The rules are injected into context on every request. A 200-line file burns tokens and buries the important bits. Aim for the load-bearing conventions only.</p>

<h2>One rule, one concern</h2>
<ul>
<li>Imports: barrel files only, no deep relative paths.</li>
<li>Tests: co-locate next to source, name <code>*.test.ts</code>.</li>
<li>Types: prefer inferred; explicit only at module boundaries.</li>
</ul>

<h2>Generate, then trim</h2>
<p>Start from a scan-based draft so the rules reflect your actual repo, then cut anything generic. <a href="/">Generate Cursor rules from your repository</a> and keep the 10% that matters.</p>
`,
},
]

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
