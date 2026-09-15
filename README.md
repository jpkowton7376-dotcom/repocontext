# RepoContext

**Turn any GitHub repository into AI-ready context — generate verified `AGENTS.md`, `CLAUDE.md`, and Cursor rules in seconds.**

[![Try it free](https://img.shields.io/badge/Try%20it%20free-repocontext.dev-blue)](https://www.repocontext.dev)

RepoContext analyzes your repository's real structure — framework, package manager, test and build commands, source layout — and produces context files your AI coding agents can actually act on. Every line is verified against the codebase, not copied from a generic template.

👉 **[repocontext.dev](https://www.repocontext.dev)** · Free tier, no credit card required.

---

## What is RepoContext

RepoContext is a SaaS tool that analyzes a GitHub repository and auto-generates `AGENTS.md`, `CLAUDE.md`, and Cursor rules from the repo's real structure. Unlike generic templates, every line it produces is verified against your actual code — framework, package manager, test/build commands, and source layout.

## How to use it

1. Go to **[repocontext.dev](https://www.repocontext.dev)**.
2. Paste any public GitHub repository URL (e.g. `https://github.com/owner/repo`).
3. Choose the output format — `AGENTS.md`, `CLAUDE.md`, or `.cursorrules`.
4. Copy or download the generated context file and drop it into your project.

No sign-up is required for the first analysis, and a free tier is available without a credit card.

## Local installation

### 1. Install dependencies

```bash
cd repocontext-app
npm install
```

### 2. Configure environment (optional)

Copy `.env.example` to `.env.local`. The app works out of the box with a deterministic fallback; set `OPENAI_API_KEY` and `GITHUB_TOKEN` to improve quality and avoid rate limits:

```env
OPENAI_API_KEY=sk-xxx      # optional — better generation via LLM
GITHUB_TOKEN=ghp-xxx       # recommended — higher GitHub API rate limit
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

See `.env.example` for the full list of optional integrations (Supabase, Creem, Resend, Sentry).

### 3. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## License

MIT
