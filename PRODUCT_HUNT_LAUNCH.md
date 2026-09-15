# RepoContext — Product Hunt Launch Kit

> Use this for the first Product Hunt launch. Keep the tagline short, the first comment honest, and reply to every comment within the first 2 hours.

## 1. Core listing fields

| Field | Value |
|-------|-------|
| **Name** | RepoContext |
| **Tagline (≤60 char)** | Turn any GitHub repo into AI-ready context in seconds |
| **URL** | https://www.repocontext.dev |
| **Topics** | Developer Tools, Artificial Intelligence, GitHub, Productivity, Open Source |
| **Pricing** | Free tier, no credit card. Pro from $9/mo. |

## 2. Gallery images (upload 3–5)

1. **First image (hero)** — `generated-images/A_clean_modern_Product_Hunt_la_2026-09-15T12-34-14.png`
   - This is the one shown in the gallery feed. Swap for a real product screenshot if you prefer.
2. Homepage — paste a GitHub URL, see the generated AGENTS.md.
3. Result page — quality score + Evidence panel.
4. Multi-format output — AGENTS.md / CLAUDE.md / Cursor rules side by side.
5. (Optional) Pricing page.

> Tip: Product Hunt first image renders at 1270×760 landscape. Make image #1 the most legible on its own.

## 3. Maker comment (post as the first comment right after launch)

```
Hey Product Hunt 👋 I'm Kowton, maker of RepoContext.

AI coding agents are only as good as the context you give them. Most teams
either skip writing AGENTS.md / CLAUDE.md, or copy a generic template that
drifts from the real repo the moment code changes.

RepoContext scans your repository's actual structure — framework, package
manager, the real install/run/test/lint commands, source layout — and
generates a verified AGENTS.md, CLAUDE.md, and Cursor rules in seconds.

No guessing, no stale docs: every line is tied to the code, not a template.

It works on public and private repos, and the free tier needs no credit card.

Would love your feedback — what would make this a daily-use tool for you?
```

## 4. Short social snippets (X / Reddit)

- **X (launch day):** "Shipped RepoContext on @ProductHunt 🚀 Paste a GitHub repo, get a verified AGENTS.md / CLAUDE.md / Cursor rules in seconds. Free tier, no card. → https://www.repocontext.dev"
- **Reddit (r/cursor):** "I built a tool that turns any repo into AGENTS.md + CLAUDE.md + Cursor rules, verified against the actual code. Free tier. Feedback welcome."
- **Reddit (r/ClaudeAI):** same angle, lead with CLAUDE.md + private-repo workflow.

## 5. Launch-day checklist

- [ ] Schedule launch for **Tue–Thu, 12:01 AM PT** (best traffic).
- [ ] Draft ready in PH (don't publish yet).
- [ ] First comment written and pasted within 5 min of going live.
- [ ] Post to X + 2 Reddit threads within the first hour.
- [ ] Reply to EVERY comment for the first 2–3 hours (engagement drives rank).
- [ ] Email your waitlist / existing users: "We're on Product Hunt today."
- [ ] Do NOT buy upvotes. Organic only.
- [ ] After launch: screenshot the final rank for the "as seen on" badge.

> **冲榜要点（若目标是冲 Product Hunt 排名）：**
> - 提前 2–3 天约好 3–5 位朋友，请他们在 Launch 当天**前 1 小时**用**有历史的 PH 账号**留真实评论（新账号评论易被算法过滤）。
> - 发布后**前 2–3 小时保持在线**，逐条回复每条评论——互动速度直接决定排名。
> - X / Reddit 引流帖带 PH 链接，在发布后 **1 小时内**发出（文案见 §4 / §7）。
> - 绝不购买 upvote（会封禁并清零排名）。
> - 真实产品截图（图 2–4，见 §9）能显著拉高点击→转化，冲榜时建议补齐。

## 6. Follow-up (week after)

- [ ] Thank top commenters publicly.
- [ ] Add "Featured on Product Hunt" badge to homepage footer.
- [ ] Repurpose the maker comment into a Show HN post.

## 7. Localized social snippets (es / ja)

The site ships en / es / zh-Hant / ja. Localize the launch push for the Spanish and
Japanese markets too. Keep the link and the free-tier hook; lead with the local phrase.

### 🇪🇸 Spanish (Spain + LatAm)
- **X (launch day):**
  ```
  Acabo de publicar RepoContext en @ProductHunt 🚀 Pega un repositorio de GitHub y obtén un AGENTS.md, CLAUDE.md y Cursor rules verificados contra el código real en segundos. Plan gratuito sin tarjeta. → https://www.repocontext.dev
  ```
- **Reddit (r/devops, r/programming):** "Construí una herramienta que convierte cualquier repo en AGENTS.md + CLAUDE.md + Cursor rules, verificado contra el código real. Gratis para empezar. Comentarios bienvenidos."
- **Tagline (es):** `Convierte cualquier repo de GitHub en contexto listo para IA en segundos`

### 🇯🇵 Japanese (Japan)
- **X (launch day):**
  ```
  RepoContext を @ProductHunt で公開しました 🚀 GitHub リポジトリを貼るだけで、実コードから検証済みの AGENTS.md / CLAUDE.md / Cursor rules を数秒で生成します。無料プランあり（カード不要）。→ https://www.repocontext.dev
  ```
- **Reddit (r/programming_jp, r/VSCodeJP):** "GitHub リポジトリを貼るだけで、実際のコードから検証済みの AGENTS.md / CLAUDE.md / Cursor rules を生成するツールを作りました。無料プランあり。フィードバック歓迎です。"
- **Tagline (ja):** `GitHub リポジトリを数秒で AI が理解できるコンテキストに変換`

> Note: post localized snippets a few hours after the EN launch so you can still reply in
> real time; don't span all languages in the same minute (looks like a bot).

## 8. Show HN (Hacker News) — post ~1 week after Product Hunt

Hacker News rewards substance over marketing. Lead with what it *does* and why it's
technically interesting. No tagline fluff, no "we're excited to share".

**Title:**
```
Show HN: RepoContext – turn any GitHub repo into verified AGENTS.md / CLAUDE.md / Cursor rules
```

**First comment (post as the same account):**
```
I built RepoContext because every AI coding agent I tried kept guessing at my
repo's structure — wrong test commands, invented dependencies, stale conventions.

RepoContext scans the actual repository (package manager, build tool, CI config,
test runner, directory layout) and generates a context file the agent can act on.
The part I care about: every statement is tied to evidence from the repo, so it
doesn't just sound plausible.

It emits AGENTS.md, CLAUDE.md, and .cursorrules from one scan so they never drift
apart, and works on private repos (read-only GitHub access, source isn't stored).

Free tier, no credit card: https://www.repocontext.dev
Happy to answer anything about the pipeline (scan → generate → verify) or how the
evidence linking works.
```

**Tips:**
- Submit from an account with some karma; brand-new accounts get flagged.
- Reply to every technical question in the first few hours — HN rewards engagement.
- If it gains traction, the "Email support@repocontext.dev" thread is your real conversion path.
- Cross-post the same angle to r/selfhosted or r/programming only if it fits naturally.

## 9. Product screenshot copy (gallery images 2–4)

Image #1 is the hero (already generated). For images 2–4, capture **real screenshots**
and use these as on-image headlines / captions.

### Image 2 — Result page (the "wow" shot)
- **Headline:** `Paste a repo. Get verified context.`
- **Caption:** RepoContext scans the real repository and returns AGENTS.md, CLAUDE.md, and Cursor rules — every line backed by evidence from your code.
- **Show:** the repo URL input → result panel with the generated file + the quality score badge.

### Image 3 — Multi-format output
- **Headline:** `One scan. Three formats.`
- **Caption:** AGENTS.md, CLAUDE.md, and .cursorrules from a single analysis — they never drift apart.
- **Show:** the three format tabs/panels side by side.

### Image 4 — Quality score + Evidence
- **Headline:** `Know how reliable it is.`
- **Caption:** A numerical quality score and clickable evidence for every claim — no more guessing where a recommendation came from.
- **Show:** the score gauge + an expanded evidence panel.
