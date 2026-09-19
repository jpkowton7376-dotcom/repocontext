// Official RepoContext client (scaffold).
//
// Turns any GitHub repository into AI-ready context — AGENTS.md, CLAUDE.md,
// Cursor rules, Copilot instructions, a quality score, and an audit — via the
// RepoContext public API.
//
// Zero dependencies. Runs on Node 18+ (global `fetch`) and in modern browsers.
//
//   import { RepoContextClient } from "repocontext";
//   const rc = new RepoContextClient(process.env.REPOCONTEXT_API_KEY);
//   const res = await rc.analyze("https://github.com/octocat/Hello-World");
//   console.log(res.agentsMd);
//
// NOTE: This client targets the public JSON API at `/api/v1/analyze`.
// Authentication currently uses a RepoContext API key (Bearer token). If you
// are calling the app's own `/api/analyze` route instead, pass a Supabase
// session token via the `token` option.

/**
 * @typedef {Object} AnalyzeOptions
 * @property {string} [plan]        Plan hint, e.g. "free" | "pro" | "team".
 * @property {string} [githubToken] GitHub PAT for private-repo access.
 * @property {string} [token]       Bearer token (Supabase session or API key).
 * @property {AbortSignal} [signal] Abort signal for the request.
 */

const DEFAULT_BASE = "https://www.repocontext.dev";

export class RepoContextClient {
  /**
   * @param {string} apiKey  RepoContext API key (Bearer token).
   * @param {{ baseUrl?: string }} [opts]
   */
  constructor(apiKey, opts = {}) {
    if (!apiKey || typeof apiKey !== "string") {
      throw new Error("RepoContextClient requires an API key");
    }
    this.apiKey = apiKey;
    this.baseUrl = (opts.baseUrl || DEFAULT_BASE).replace(/\/+$/, "");
  }

  /**
   * Analyze a repository and return structured, AI-ready context.
   *
   * @param {string} repoUrl  Full GitHub URL, e.g. https://github.com/owner/repo
   * @param {AnalyzeOptions} [options]
   * @returns {Promise<any>}  The analysis result (formats, quality, audit, …).
   */
  async analyze(repoUrl, options = {}) {
    const { plan, githubToken, token, signal } = options;
    const auth = token || this.apiKey;

    const res = await fetch(`${this.baseUrl}/api/v1/analyze`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repoUrl, plan, githubToken }),
      signal,
    });

    if (!res.ok) {
      let message = `RepoContext request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data && data.error) message = data.error;
      } catch {
        // body was not JSON — keep the status-based message
      }
      throw new Error(message);
    }

    return res.json();
  }
}

/**
 * Convenience helper for one-off analyses without instantiating a client.
 *
 * @param {string} repoUrl
 * @param {string} apiKey
 * @param {AnalyzeOptions} [options]
 * @returns {Promise<any>}
 */
export async function analyzeRepo(repoUrl, apiKey, options = {}) {
  return new RepoContextClient(apiKey).analyze(repoUrl, options);
}

export default RepoContextClient;
