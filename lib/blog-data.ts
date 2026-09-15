export interface BlogPost {
  slug: string
  title: string
  titleZh: string
  date: string
  excerpt: string
  excerptZh: string
  /** English body — plain HTML rendered with dangerouslySetInnerHTML. */
  body: string
  /** Traditional Chinese body (matches the site's zh-Hant locale). */
  bodyZh: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-write-agents-md",
    title: "How to write an AGENTS.md that actually helps your AI coding agent",
    titleZh: "如何寫出真正對 AI 編碼助手有用的 AGENTS.md",
    date: "2026-09-15",
    excerpt:
      "A practical guide to writing AGENTS.md, CLAUDE.md, and Cursor rules that AI agents can act on — based on what RepoContext scans from real repositories.",
    excerptZh:
      "一份實用指南：如何寫出 AI 助手能直接執行的 AGENTS.md、CLAUDE.md 與 Cursor rules —— 基於 RepoContext 對真實程式庫的掃描結果。",
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
    bodyZh: `
<p>AI 編碼助手的表現，取決於你給它的脈絡。一份 <strong>AGENTS.md</strong> 是讓 AI 理解你程式庫運作方式最快的方法 —— 但多數團隊要麼完全略過，要麼寫出一份像 README 的檔案。</p>

<h2>AGENTS.md 應該包含什麼</h2>
<ul>
  <li><strong>技術堆疊</strong> —— 語言、框架、套件管理器、建置工具。</li>
  <li><strong>指令</strong> —— 如何安裝、執行、測試與檢查。</li>
  <li><strong>專案結構</strong> —— 原始碼與測試放在哪裡。</li>
  <li><strong>慣例</strong> —— 那些如果沒有說明，AI 就會搞錯的關鍵規則。</li>
</ul>

<h2>AGENTS.md、CLAUDE.md 與 Cursor Rules 的差異</h2>
<p>它們描述的是同一個概念，只是形式略有不同。<strong>AGENTS.md</strong> 是開放、跨工具的標準；<strong>CLAUDE.md</strong> 是 Anthropic 為 Claude 設計的變體；<strong>Cursor Rules</strong>（<code>.cursorrules</code>）則是 Cursor IDE 的格式。RepoContext 可以從一次掃描同時產出這三者，使它們永遠保持一致。</p>

<h2>保持真實且即時</h2>
<p>每一句都應該要經過程式庫<em>驗證</em>，而不是從某篇部落格複製。程式碼一改動，檔案就會過時 —— 請在重構後重新產生，而不只是在專案開始時寫一次。</p>

<p>想從你自己的程式庫在幾秒內產生一份嗎？<a href="/">試試 RepoContext</a>。</p>
`,
  },
  {
    slug: "agents-md-vs-claude-md-vs-cursor-rules",
    title: "AGENTS.md vs CLAUDE.md vs Cursor Rules: which context file should you use?",
    titleZh: "AGENTS.md、CLAUDE.md 與 Cursor Rules：你該用哪一份脈絡檔？",
    date: "2026-09-15",
    excerpt:
      "The three major AI context file formats compared — what they share, where they differ, and how to keep them in sync.",
    excerptZh:
      "比較三種主流 AI 脈絡檔格式 —— 它們的共通點、差異，以及如何保持同步。",
    body: `
<p>If you use more than one AI coding tool, you have probably seen <strong>AGENTS.md</strong>, <strong>CLAUDE.md</strong>, and <strong>Cursor Rules</strong> and wondered whether you need all three.</p>

<h2>The short answer</h2>
<p>Use <strong>AGENTS.md</strong> as your canonical file — it is the emerging open standard. Mirror it into <strong>CLAUDE.md</strong> and <strong>.cursorrules</strong> for tools that expect their own format. The content is the same; only the filename differs.</p>

<h2>Why keep them in sync</h2>
<p>Drift is the real risk. When your Cursor rules say one thing and your CLAUDE.md says another, the agent picks the wrong convention. Generate all three from a single source so they never disagree.</p>

<p>RepoContext scans your repository and produces all three formats at once. <a href="/">Generate yours</a>.</p>
`,
    bodyZh: `
<p>如果你同時使用多種 AI 編碼工具，你可能已經看過 <strong>AGENTS.md</strong>、<strong>CLAUDE.md</strong> 與 <strong>Cursor Rules</strong>，並納悶自己是否三者都需要。</p>

<h2>簡短答案</h2>
<p>把 <strong>AGENTS.md</strong> 當作你的主要檔案 —— 它是正在成形的開放標準。再把它鏡像成 <strong>CLAUDE.md</strong> 與 <strong>.cursorrules</strong>，供那些使用各自格式的工具使用。內容相同，只是檔名不同。</p>

<h2>為什麼要保持同步</h2>
<p>真正的風險在於「漂移」。當你的 Cursor rules 說一套、CLAUDE.md 說另一套，AI 就會選錯慣例。從單一來源產生這三份，它們就不會再互相矛盾。</p>

<p>RepoContext 會掃描你的程式庫，一次產生全部三種格式。<a href="/">立即產生你的版本</a>。</p>
`,
  },
  {
    slug: "how-to-use-claude-md-with-private-repos",
    title: "How to use CLAUDE.md with private repositories",
    titleZh: "如何在私有程式庫中使用 CLAUDE.md",
    date: "2026-09-15",
    excerpt:
      "Private repos need a different CLAUDE.md workflow — token access, what not to commit, and how to keep context current without leaking secrets.",
    excerptZh:
      "私有程式庫需要不同的 CLAUDE.md 工作流程 —— 權杖存取、什麼不該提交，以及如何在洩漏機密的前提下保持脈絡即時。",
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
    bodyZh: `
<p>多數教學都假設是公開程式庫。對於<strong>私有程式庫</strong>，要安全地使用 <strong>CLAUDE.md</strong> 需要額外幾個步驟，才能在不洩漏機密或內部架構的情況下提供脈絡給 Claude。</p>

<h2>1. 授予正確的存取權限</h2>
<p>Claude Code 使用 GitHub 權杖驗證。對於私有程式庫，請使用限定在該程式庫範圍內的權杖（或 GitHub App 安裝）—— 優先使用細粒度權杖而非傳統權杖，並設定到期時間。</p>

<h2>2. 不要把機密寫進 CLAUDE.md</h2>
<p>絕對不要把 API 金鑰、.env 內容或內部端點貼進脈絡檔。描述機密<em>存放的位置</em>與<em>載入方式</em>，而不是它們的值：</p>
<pre><code># 設定
- 從 .env 載入機密（絕不提交）
- 透過 GITHUB_TOKEN 驗證，於執行時注入</code></pre>

<h2>3. 若程式庫對外共享，請勿提交</h2>
<p>如果有外包人員或公開鏡像會碰到該程式庫，請把 CLAUDE.md 排除在預設分支之外。你仍然可以在本地產生它，並放到 <code>~/.claude/</code> 的專案記憶中。</p>

<h2>4. 重構後重新產生</h2>
<p>私有程式碼變動很快。過時的脈絡檔比沒有好。<a href="/">從你的私有程式庫產生一份全新的 CLAUDE.md</a>，並在結構改變時重新放回。</p>
`,
  },
  {
    slug: "keep-agents-md-in-sync-with-codebase",
    title: "How to keep AGENTS.md in sync with your codebase (CI automation)",
    titleZh: "如何讓 AGENTS.md 與你的程式碼保持同步（CI 自動化）",
    date: "2026-09-15",
    excerpt:
      "AGENTS.md rots the moment code changes. Here is how to regenerate it automatically in CI so your AI agents never read stale context.",
    excerptZh:
      "AGENTS.md 在程式碼一改動就會過時。本文說明如何在 CI 中自動重新產生，讓 AI 助手永遠不會讀到過時的脈絡。",
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
    bodyZh: `
<p><strong>AGENTS.md</strong> 只有在與現實相符時才有用。讓它保持真實最快的方法，是停止把它當作手寫文件，而是當作一種建置產物。</p>

<h2>為什麼它會過時</h2>
<p>指令會改變、目錄會移動、新的測試執行器會出現。幾週內，一份過時的檔案就會在描述一個已不存在的專案 —— 而 AI 會去執行那些失敗的指令。</p>

<h2>在 CI 中自動重新產生</h2>
<ul>
  <li>新增一個工作，在每次 pull request 時重新掃描程式庫。</li>
  <li>比對產生的 AGENTS.md 與已提交的版本。</li>
  <li>若兩者不同，把更新貼成 PR 留言，或讓檢查失敗，由某人提交。</li>
</ul>

<h2>把它變成關卡，而不是建議</h2>
<p>把這個檢查接進合併規則。這樣脈絡漂移會出現在審查中，就在造成它的程式碼旁邊。</p>

<p><a href="/">RepoContext</a> 能從經過驗證的掃描產生 AGENTS.md —— 把它接進排程工作，你的 AI 助手永遠都讀到最新的脈絡。</p>
`,
  },
  {
    slug: "cursor-rules-best-practices",
    title: "Cursor rules best practices: write rules your agent won't ignore",
    titleZh: "Cursor Rules 最佳實踐：寫出 AI 不會忽略的規則",
    date: "2026-09-15",
    excerpt:
      "Most .cursorrules files are too long or too vague to help. Practical rules for writing Cursor rules that actually change agent behavior.",
    excerptZh:
      "多數 .cursorrules 檔案都太長或太模糊而派不上用場。撰寫能真正改變 AI 行為的 Cursor rules 的實用守則。",
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
    bodyZh: `
<p><strong>Cursor Rules</strong>（<code>.cursorrules</code>）只有在 AI 能遵循時才有效。多數團隊寫了一整面文字，卻納悶為什麼什麼都沒變。</p>

<h2>具體且可執行</h2>
<p>把「寫乾淨的程式碼」換成「在標記任務完成前先執行 <code>pnpm lint</code>」。AI 遵循具體指令遠比遵循形容詞來得好。</p>

<h2>保持精簡</h2>
<p>這些規則會在每次請求時被注入脈絡。200 行的檔案會消耗 token，也會埋沒重要的部分。只保留那些關鍵的慣例。</p>

<h2>一條規則，一個關注點</h2>
<ul>
  <li>匯入：只用 barrel 檔，不要深層相對路徑。</li>
  <li>測試：與原始碼放在一起，命名為 <code>*.test.ts</code>。</li>
  <li>型別：優先推論；只有在模組邊界才明確指定。</li>
</ul>

<h2>先產生，再精簡</h2>
<p>先從基於掃描的草稿開始，讓規則反映你真實的程式庫，再刪掉任何通用的內容。<a href="/">從你的程式庫產生 Cursor rules</a>，只留下那 10% 真正重要的部分。</p>
`,
  },
  {
    slug: "agents-md-generator",
    title: "AGENTS.md generator: the fastest way to bootstrap AI context for any repo",
    titleZh: "AGENTS.md 產生器：為任何程式庫快速建立 AI 脈絡的最快方法",
    date: "2026-09-15",
    excerpt:
      "What an AGENTS.md generator actually does, why hand-writing falls short, and how RepoContext turns a repo URL into a verified context file in seconds.",
    excerptZh:
      "AGENTS.md 產生器究竟做什麼、為什麼手寫不夠好，以及 RepoContext 如何把一個程式庫網址在幾秒內轉換成經過驗證的脈絡檔。",
    body: `
<p>An <strong>AGENTS.md generator</strong> takes a repository and produces a context file your AI coding agent can use immediately — without you writing a word. Here is what good ones do differently.</p>

<h2>What an AGENTS.md generator does</h2>
<p>It scans the repository's real structure: detected language and framework, the package manager, the actual install/run/test/lint commands from scripts, and the source layout. Then it assembles a file an agent can act on.</p>

<h2>Why hand-writing falls short</h2>
<ul>
  <li><strong>It rots.</strong> The moment code changes, a hand-written file is stale.</li>
  <li><strong>It guesses.</strong> People copy commands from blog posts that don't match their repo.</li>
  <li><strong>It drifts.</strong> CLAUDE.md and .cursorrules get edited separately and disagree.</li>
</ul>

<h2>What to look for in a generator</h2>
<ul>
  <li><strong>Verified output</strong> — every claim tied to the actual repo, not a template.</li>
  <li><strong>Multi-format</strong> — emits AGENTS.md, CLAUDE.md, and .cursorrules from one scan.</li>
  <li><strong>Private-repo ready</strong> — works on repos you don't want to make public.</li>
</ul>

<h2>Try it</h2>
<p>Paste a GitHub URL and <a href="/">generate your AGENTS.md</a> in seconds. Free tier, no credit card.</p>
`,
    bodyZh: `
<p><strong>AGENTS.md 產生器</strong>會讀取一個程式庫，並產出一份你的 AI 編碼助手能立即使用的脈絡檔 —— 你不需要自己寫一個字。以下是優秀的產生器與眾不同的地方。</p>

<h2>AGENTS.md 產生器做什麼</h2>
<p>它掃描程式庫真實的結構：偵測到的語言與框架、套件管理器、從腳本中擷取的實際安裝／執行／測試／檢查指令，以及原始碼的組織方式。然後組裝出一份助手能執行的檔案。</p>

<h2>為什麼手寫不夠好</h2>
<ul>
  <li><strong>它會過時。</strong> 程式碼一改動，手寫的檔案就過時了。</li>
  <li><strong>它會猜測。</strong> 人們從與自己程式庫不符的部落格複製指令。</li>
  <li><strong>它會漂移。</strong> CLAUDE.md 與 .cursorrules 被分開編輯後互相矛盾。</li>
</ul>

<h2>挑選產生器時要看什麼</h2>
<ul>
  <li><strong>經過驗證的產出</strong> —— 每一句都對應真實的程式庫，而不是範本。</li>
  <li><strong>多格式</strong> —— 從一次掃描同時產出 AGENTS.md、CLAUDE.md 與 .cursorrules。</li>
  <li><strong>支援私有程式庫</strong> —— 能用在你不打算公開的程式庫上。</li>
</ul>

<h2>試試看</h2>
<p>貼上一個 GitHub 網址，<a href="/">幾秒內產生你的 AGENTS.md</a>。有免費方案，無須信用卡。</p>
`,
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
