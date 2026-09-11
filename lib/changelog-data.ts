/**
 * Single source of truth for changelog entries. Both the human-readable
 * /changelog page and the RSS feed at /changelog/rss.xml import this so
 * the two stay in lock-step.
 *
 * Newest entry first. `slug` is used to build canonical URLs and stable
 * RSS item ids; it should never change once an entry ships.
 */

export type ChangelogKind = "added" | "improved" | "fixed" | "removed" | "security"
export type ChangelogTag = "New" | "Improvement" | "Launch" | "Fix" | "Security"

export interface ChangelogItem {
  kind: ChangelogKind
  text: string
}

export interface ChangelogEntry {
  /** ISO date (YYYY-MM-DD) of the release. */
  date: string
  /** Display date (e.g. "September 2, 2026") for the human-readable page. */
  displayDate: string
  /** Short category badge shown next to the title. */
  tag: ChangelogTag
  title: string
  /** One-paragraph summary, shown on the page. */
  summary: string
  /** Per-change bullets. */
  items: ChangelogItem[]
  /** Stable URL slug — must not change after release. */
  slug: string
}

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-09-02",
    displayDate: "September 2, 2026",
    tag: "New",
    slug: "multi-format-export",
    title: "Multi-format export is here",
    summary:
      "Generate documentation in four formats from a single analysis: AGENTS.md, CLAUDE.md, Cursor Rules, and Copilot Instructions.",
    items: [
      { kind: "added", text: "Export to AGENTS.md, CLAUDE.md, Cursor Rules, and GitHub Copilot Instructions" },
      { kind: "added", text: "Format-specific fine-tuning so each export is idiomatic to its target" },
      { kind: "improved", text: "Re-runs of an analysis now produce byte-stable output" },
    ],
  },
  {
    date: "2026-08-19",
    displayDate: "August 19, 2026",
    tag: "Improvement",
    slug: "evidence-and-audit",
    title: "Evidence panel & AGENTS.md Audit",
    summary:
      "Every claim is now traceable to the source file that produced it, and existing AGENTS.md files can be audited for accuracy and freshness.",
    items: [
      { kind: "added", text: "Evidence panel showing the exact file behind every generated statement" },
      { kind: "added", text: "AGENTS.md audit with a quality score and a checklist of concrete fixes" },
      { kind: "fixed", text: "False-positive detection of monorepo workspaces" },
    ],
  },
  {
    date: "2026-08-05",
    displayDate: "August 5, 2026",
    tag: "Improvement",
    slug: "private-repos-and-dashboard",
    title: "Private repository support & dashboard",
    summary:
      "Connect private GitHub repositories securely. Your code never leaves your control.",
    items: [
      { kind: "added", text: "GitHub OAuth for private repositories" },
      { kind: "added", text: "Dashboard with analysis history and quality trends" },
      { kind: "improved", text: "Scan latency reduced by ~40% for large repositories" },
    ],
  },
  {
    date: "2026-07-21",
    displayDate: "July 21, 2026",
    tag: "Launch",
    slug: "public-beta",
    title: "RepoContext public beta",
    summary:
      "RepoContext is live. Paste any GitHub URL and get accurate, structured documentation for AI coding agents in seconds.",
    items: [
      { kind: "added", text: "Public repository analysis with intelligent framework detection" },
      { kind: "added", text: "Quality score so you know how much you can trust the result" },
    ],
  },
]
