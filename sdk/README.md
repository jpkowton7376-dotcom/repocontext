# repocontext

Official RepoContext client — turn any GitHub repository into AI-ready context
(`AGENTS.md`, `CLAUDE.md`, Cursor rules, Copilot instructions, a quality score,
and an audit) via the RepoContext public API.

Zero dependencies. Runs on Node 18+ (global `fetch`) and in modern browsers.

## Install

```bash
npm install repocontext
# or
pnpm add repocontext
```

## Usage

```js
import { RepoContextClient } from "repocontext";

const rc = new RepoContextClient(process.env.REPOCONTEXT_API_KEY);

const analysis = await rc.analyze("https://github.com/octocat/Hello-World", {
  // githubToken: process.env.GITHUB_TOKEN, // for private repos
  // plan: "pro",
});

// Write the generated context files
console.log(analysis.agentsMd);   // # AGENTS.md
console.log(analysis.claudeMd);   // # CLAUDE.md
console.log(analysis.cursorRules);
```

### One-off helper

```js
import { analyzeRepo } from "repocontext";

const analysis = await analyzeRepo(
  "https://github.com/octocat/Hello-World",
  process.env.REPOCONTEXT_API_KEY
);
```

## API

### `new RepoContextClient(apiKey, { baseUrl })`

| Param    | Type     | Default                          | Notes                          |
| -------- | -------- | -------------------------------- | ------------------------------ |
| apiKey   | string   | —                                | Bearer token for the API.      |
| baseUrl  | string   | `https://www.repocontext.dev`    | Override for self-hosting.     |

### `client.analyze(repoUrl, options)`

| Option       | Type     | Notes                                              |
| ------------ | -------- | -------------------------------------------------- |
| `plan`       | string   | Plan hint: `free` \| `pro` \| `team`.              |
| `githubToken`| string   | GitHub PAT to analyze private repositories.        |
| `token`      | string   | Override the Bearer token (e.g. a session token).  |
| `signal`     | AbortSignal | Abort the underlying request.                    |

Resolves to the analysis object (see `formats`, `quality`, `audit`, `evidence`).

## Endpoint

This client targets the public JSON API at `POST /api/v1/analyze`. Set `baseUrl`
when pointing at a self-hosted or staging deployment.

## License

MIT
