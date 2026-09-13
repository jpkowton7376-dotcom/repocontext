// Community data layer — project-gallery model inspired by blueprint.io/community.
// A "project" is a shareable repo context setup: AGENTS.md, Cursor Rules, etc.

export type CategoryId = "showcase" | "recipe" | "template" | "workflow"

export interface Category {
  id: CategoryId
  label: string
  color: string
  description: string
}

export interface Author {
  name: string
  handle: string
  avatarColor: string
  role?: string
}

export type ContextFormat = "agents" | "claude" | "cursor" | "copilot" | "custom"

export const FORMAT_LABELS: Record<ContextFormat, string> = {
  agents: "AGENTS.md",
  claude: "CLAUDE.md",
  cursor: "Cursor Rules",
  copilot: "Copilot Instructions",
  custom: "Custom",
}

export const FORMAT_COLORS: Record<ContextFormat, string> = {
  agents: "#0f62fe",
  claude: "#6929c4",
  cursor: "#009d9a",
  copilot: "#198038",
  custom: "#cc6600",
}

export interface ProjectFile {
  name: string
  format: ContextFormat
  content: string
}

export interface ProjectPart {
  name: string
  category: string
  description?: string
  count?: number
}

export interface ProjectStep {
  title: string
  items: string[]
}

export interface Project {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  author: Author
  cover: string
  repoUrl?: string
  category: CategoryId
  tags: string[]
  formats: ContextFormat[]
  files: ProjectFile[]
  structure: string[]
  parts: ProjectPart[]
  instructions: ProjectStep[]
  stars: number
  createdAt: number
  pinned?: boolean
}

export type SortKey = "trending" | "new" | "top"

export const CATEGORIES: Category[] = [
  {
    id: "showcase",
    label: "Showcases",
    color: "#0f62fe",
    description: "Complete repo context setups you can study and copy.",
  },
  {
    id: "recipe",
    label: "Recipes",
    color: "#6929c4",
    description: "Small, reusable snippets for specific problems.",
  },
  {
    id: "template",
    label: "Templates",
    color: "#009d9a",
    description: "Drop-in starters for common project types.",
  },
  {
    id: "workflow",
    label: "Workflows",
    color: "#cc6600",
    description: "CI/CD and automation setups that keep context in sync.",
  },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c
    return acc
  },
  {} as Record<CategoryId, Category>,
)

const A = {
  mai: { name: "Mai Tran", handle: "mait", avatarColor: "#0f62fe", role: "Community Lead" },
  devon: { name: "Devon Park", handle: "devonp", avatarColor: "#6929c4" },
  sora: { name: "Sora Kim", handle: "sora", avatarColor: "#009d9a" },
  luis: { name: "Luis Fernández", handle: "luisf", avatarColor: "#cc6600" },
  toby: { name: "Toby Wright", handle: "tobyw", avatarColor: "#198038" },
  nadia: { name: "Nadia Rahman", handle: "nadiar", avatarColor: "#8a3ffc" },
  kenji: { name: "Kenji Sato", handle: "kenjis", avatarColor: "#1192e8" },
} satisfies Record<string, Author>

const HOUR = 3600_000
const now = Date.now()

function file(name: string, format: ContextFormat, content: string): ProjectFile {
  return { name, format, content }
}

export const SEED_PROJECTS: Project[] = [
  {
    id: "p1",
    slug: "monorepo-onboarding-agents-md",
    title: "Monorepo onboarding with AGENTS.md",
    summary: "Cut new-hire onboarding from 3 days to 20 minutes using a generated AGENTS.md.",
    description:
      "We onboard every backend engineer by having them read the repo for a few days. I ran RepoContext on our monorepo and dropped the generated AGENTS.md at the root. The result was shockingly accurate.",
    author: A.devon,
    cover: "/templates/sample-monorepo.jpg",
    repoUrl: "https://github.com/example/monorepo",
    category: "showcase",
    tags: ["AGENTS.md", "onboarding", "monorepo"],
    formats: ["agents", "cursor"],
    files: [
      file(
        "AGENTS.md",
        "agents",
        "# Monorepo onboarding guide\n\n## Architecture\n- apps/web: Next.js marketing site\n- apps/api: NestJS API\n- packages/ui: shared React components\n- packages/db: Prisma schema + migrations\n\n## Build commands\n- web: pnpm --filter web build\n- api: pnpm --filter api build\n- db: pnpm --filter db migrate\n\n## Testing\nUse `pnpm test` at root. Integration tests need docker compose up.",
      ),
      file(
        ".cursorrules",
        "cursor",
        "# Cursor rules for monorepo\n- Prefer pnpm workspace protocols for internal deps\n- Run typecheck before committing\n- Use packages/ui components before writing new ones\n- API routes live in apps/api/src/routes",
      ),
    ],
    structure: ["apps/web/", "apps/api/", "packages/ui/", "packages/db/", "AGENTS.md", ".cursorrules", "pnpm-workspace.yaml", "turbo.json"],
    parts: [
      { name: "AGENTS.md", category: "Context", description: "Root onboarding guide", count: 1 },
      { name: ".cursorrules", category: "Context", description: "Cursor-specific rules", count: 1 },
      { name: "Web app", category: "App", count: 1 },
      { name: "API service", category: "App", count: 1 },
      { name: "Shared packages", category: "Package", count: 2 },
    ],
    instructions: [
      { title: "Copy the context files", items: ["Download AGENTS.md and .cursorrules from the Files tab.", "Place both files at the root of your repo."] },
      { title: "Customize for your repo", items: ["Edit the on-call rotation link.", "Update package names and build commands to match your workspace."] },
      { title: "Verify in Cursor", items: ["Open the repo in Cursor.", "Ask the agent to describe the architecture to confirm it reads AGENTS.md."] },
    ],
    stars: 142,
    createdAt: now - 5 * HOUR,
    pinned: true,
  },
  {
    id: "p2",
    slug: "cursor-rules-ci-sync",
    title: "Keep Cursor Rules in sync with CI",
    summary: "A GitHub Actions workflow that regenerates .cursorrules on every push to main.",
    description:
      "Our generated .cursorrules drifted every time someone landed a big refactor. I wired RepoContext into CI via the REST API so the docs never drift for more than a few minutes.",
    author: A.luis,
    cover: "/templates/best-cicd.jpg",
    repoUrl: "https://github.com/example/ci-cursor-sync",
    category: "workflow",
    tags: ["Cursor Rules", "CI", "automation"],
    formats: ["cursor"],
    files: [
      file(
        ".github/workflows/sync-cursorrules.yml",
        "custom",
        'name: Sync Cursor Rules\n\non:\n  push:\n    branches: [main]\n\njobs:\n  sync:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Generate .cursorrules\n        run: |\n          curl -X POST https://api.repocontext.io/analyze \\\n            -H "Authorization: Bearer ${{ secrets.RC_TOKEN }}" \\\n            -d \'{"repoUrl":"https://github.com/${{ github.repository }}"}\' \\\n            -o .cursorrules\n      - name: Commit changes\n        run: |\n          git config user.name github-actions\n          git config user.email github-actions@github.com\n          git add .cursorrules\n          git diff --staged --quiet || git commit -m "chore: sync cursor rules"\n          git push',
      ),
      file(".cursorrules", "cursor", "# Auto-generated cursor rules\n- Keep in sync via .github/workflows/sync-cursorrules.yml\n- Do not edit manually on main"),
    ],
    structure: [".github/workflows/sync-cursorrules.yml", ".cursorrules", "src/", "README.md"],
    parts: [
      { name: "GitHub Action", category: "Automation", count: 1 },
      { name: ".cursorrules", category: "Context", count: 1 },
      { name: "Repository", category: "Source", count: 1 },
    ],
    instructions: [
      { title: "Add the workflow", items: ["Copy sync-cursorrules.yml into .github/workflows/.", "Add a RepoContext API token as RC_TOKEN in repository secrets."] },
      { title: "Generate baseline", items: ["Run the workflow manually once to create the first .cursorrules.", "Commit the generated file."] },
      { title: "Let it run", items: ["Every push to main will refresh .cursorrules automatically.", "Review the diff in PRs."] },
    ],
    stars: 38,
    createdAt: now - 9 * HOUR,
  },
  {
    id: "p3",
    slug: "readme-conventions-boost-score",
    title: "README conventions that 2x quality score",
    summary: "A three-line naming-conventions section lifted the RepoContext quality score from 61 to 94.",
    description:
      "The model was guessing our naming conventions. I added a three-line section to the README describing how we name modules, tests, and env files. Re-ran the analysis and the quality score jumped from 61 to 94.",
    author: A.sora,
    cover: "/templates/sample-markdown.jpg",
    repoUrl: "https://github.com/example/conventions",
    category: "recipe",
    tags: ["quality score", "README", "prompts"],
    formats: ["agents"],
    files: [
      file(
        "README.md#conventions",
        "custom",
        "## Project conventions\n\n### Naming\n- Modules: kebab-case (e.g. user-profile)\n- Tests: `<name>.test.ts` co-located with source\n- Env files: `.env.<environment>` only in /config\n\n### Running\n```bash\nnpm run dev\n```",
      ),
    ],
    structure: ["README.md", "src/", "tests/", ".env.example"],
    parts: [
      { name: "README conventions", category: "Recipe", description: "Naming and env rules", count: 1 },
      { name: "Source modules", category: "Code", count: 12 },
      { name: "Tests", category: "Code", count: 8 },
    ],
    instructions: [
      { title: "Add to your README", items: ["Copy the conventions section into your README.md.", "Adjust naming rules to match your stack."] },
      { title: "Re-analyze", items: ["Run RepoContext analysis again.", "Watch the quality score improve."] },
    ],
    stars: 96,
    createdAt: now - 14 * HOUR,
  },
  {
    id: "p4",
    slug: "rust-cli-claude-md",
    title: "CLAUDE.md for a 30k-line Rust CLI",
    summary: "Generated docs for a Rust CLI. The module map alone saved me an afternoon.",
    description:
      "Generated context for our Rust CLI and the module map it produced is genuinely good — it understood the command dispatch, the error type hierarchy, and the test layout. Sharing a sanitized version.",
    author: A.toby,
    cover: "/templates/sample-rust.jpg",
    repoUrl: "https://github.com/example/rust-cli",
    category: "showcase",
    tags: ["Rust", "CLAUDE.md", "CLI"],
    formats: ["claude"],
    files: [
      file(
        "CLAUDE.md",
        "claude",
        "# Rust CLI context\n\n## Module map\n- `main.rs`: entry point, command dispatch\n- `commands/`: one module per subcommand\n- `error.rs`: unified error type using `thiserror`\n- `config.rs`: config file parsing with `serde`\n- `tests/`: integration tests invoke the CLI binary\n\n## Conventions\n- Errors bubble up with `?`; never unwrap in library code\n- Use `clap` derive macros for CLI args\n- Config lives at `~/.config/rc/config.toml`",
      ),
    ],
    structure: ["src/main.rs", "src/commands/", "src/error.rs", "src/config.rs", "tests/", "CLAUDE.md", "Cargo.toml"],
    parts: [
      { name: "CLAUDE.md", category: "Context", count: 1 },
      { name: "Command modules", category: "Source", count: 5 },
      { name: "Core modules", category: "Source", count: 3 },
      { name: "Integration tests", category: "Tests", count: 4 },
    ],
    instructions: [
      { title: "Generate your own", items: ["Run RepoContext on your Rust repo.", "Export CLAUDE.md format."] },
      { title: "Use in Claude Code", items: ["Place CLAUDE.md at the repo root.", "Ask Claude to add a new subcommand or fix an error type."] },
    ],
    stars: 63,
    createdAt: now - 4 * 24 * HOUR,
  },
  {
    id: "p5",
    slug: "pnpm-workspace-template",
    title: "pnpm workspace starter template",
    summary: "A ready-made AGENTS.md + .cursorrules setup tuned for pnpm monorepos.",
    description:
      "pnpm workspaces are everywhere in the Node world. This template gives you a dedicated context setup that understands workspace:* dependencies and the virtual store.",
    author: A.kenji,
    cover: "/templates/sample-typescript.jpg",
    repoUrl: "https://github.com/example/pnpm-starter",
    category: "template",
    tags: ["pnpm", "monorepo", "template"],
    formats: ["agents", "cursor"],
    files: [
      file(
        "AGENTS.md",
        "agents",
        "# pnpm workspace guide\n\n## Layout\n- `apps/*`: deployable applications\n- `packages/*`: shared libraries\n\n## Dependency rules\n- Internal deps use `workspace:*`\n- External deps are hoisted by pnpm\n\n## Scripts\n- `pnpm dev` starts all apps in parallel\n- `pnpm lint` runs ESLint across the workspace\n- `pnpm test` runs Vitest in each package",
      ),
      file(
        ".cursorrules",
        "cursor",
        "# pnpm workspace cursor rules\n- Add new packages to `pnpm-workspace.yaml` first\n- Prefer `workspace:*` for internal deps\n- Shared configs live in `packages/eslint-config` and `packages/tsconfig`",
      ),
    ],
    structure: ["apps/web/", "packages/ui/", "packages/eslint-config/", "packages/tsconfig/", "AGENTS.md", ".cursorrules", "pnpm-workspace.yaml"],
    parts: [
      { name: "AGENTS.md", category: "Context", count: 1 },
      { name: ".cursorrules", category: "Context", count: 1 },
      { name: "Apps", category: "App", count: 1 },
      { name: "Shared packages", category: "Package", count: 3 },
    ],
    instructions: [
      { title: "Use the template", items: ["Copy AGENTS.md and .cursorrules to your pnpm monorepo.", "Update package and app names."] },
      { title: "Add your repo URL", items: ["Replace the example repo URL in the files.", "Run RepoContext to validate the context quality."] },
    ],
    stars: 54,
    createdAt: now - 22 * HOUR,
  },
  {
    id: "p6",
    slug: "secrets-safe-context",
    title: "Keep secrets out of generated context",
    summary: "A policy checklist and .repocontextignore recipe for private repos.",
    description:
      "Before I point this at our private repo I want to be sure nothing sensitive ends up in the generated AGENTS.md. Here is the policy and ignore list I use.",
    author: A.kenji,
    cover: "/templates/best-private.jpg",
    repoUrl: "https://github.com/example/private-safe",
    category: "recipe",
    tags: ["security", "private repos", "secrets"],
    formats: ["agents"],
    files: [
      file(
        ".repocontextignore",
        "custom",
        "# Never include these in generated context\n.env\n.env.*\n*.pem\n*.key\nsecrets/\nconfig/credentials.yml\n.vault/",
      ),
      file(
        "SECURITY.md",
        "custom",
        "# Security policy for AI context\n\n- RepoContext reads metadata and structure, not file contents by default\n- Mark credential paths in `.repocontextignore`\n- Review generated files before committing them\n- Rotate any token that accidentally appears in output",
      ),
    ],
    structure: [".repocontextignore", "SECURITY.md", "src/", ".env.example"],
    parts: [
      { name: ".repocontextignore", category: "Config", count: 1 },
      { name: "Security policy", category: "Doc", count: 1 },
      { name: "Safe paths", category: "Rule", count: 6 },
    ],
    instructions: [
      { title: "Add ignore rules", items: ["Copy .repocontextignore to your repo root.", "Add any other files that contain credentials."] },
      { title: "Analyze safely", items: ["Run RepoContext with ignore rules in place.", "Inspect the generated context for any sensitive strings."] },
    ],
    stars: 29,
    createdAt: now - 3 * 24 * HOUR,
  },
]

// ---- Pure helpers ----------------------------------------------------------

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d`
  const mo = Math.floor(d / 30)
  return `${mo}mo`
}

export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function hoursSince(ts: number): number {
  return (Date.now() - ts) / HOUR
}

export function trendingScore(p: Project): number {
  const recency = Math.max(0, 100 - hoursSince(p.createdAt) * 1.5)
  return p.stars * 2 + p.files.length * 4 + recency
}

export function sortProjects(projects: Project[], sort: SortKey): Project[] {
  const arr = [...projects]
  if (sort === "new") {
    arr.sort((a, b) => b.createdAt - a.createdAt)
  } else if (sort === "top") {
    arr.sort((a, b) => b.stars - a.stars)
  } else {
    arr.sort((a, b) => trendingScore(b) - trendingScore(a))
  }
  arr.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  return arr
}

export function filterProjects(
  projects: Project[],
  category: CategoryId | "all",
  query: string,
): Project[] {
  const q = query.trim().toLowerCase()
  return projects.filter((p) => {
    if (category !== "all" && p.category !== category) return false
    if (!q) return true
    const hay = `${p.title} ${p.summary} ${p.description} ${p.tags.join(" ")} ${p.author.name}`.toLowerCase()
    return hay.includes(q)
  })
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
