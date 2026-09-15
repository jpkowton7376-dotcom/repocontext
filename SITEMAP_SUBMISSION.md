# Sitemap Submission Checklist (one page)

Goal: get Google / Bing to discover and index `https://www.repocontext.dev` fast.
The sitemap already exists at **`/sitemap.xml`** (Next.js `app/sitemap.ts`, includes all pages + all 6 blog posts). Submit it to each engine once, then let it run.

## Before you start
- [ ] Site is live on `https://www.repocontext.dev` (not localhost).
- [ ] `https://www.repocontext.dev/sitemap.xml` returns valid XML (open it in a browser to confirm).
- [ ] `robots.txt` allows crawling (it should already reference the sitemap).

## 1. Google Search Console (most important)
- [ ] Go to https://search.google.com/search-console/
- [ ] **Add property** → choose **Domain** → enter `repocontext.dev` (covers www + all subdomains).
- [ ] Verify ownership: copy the **TXT record** GSC gives you → Cloudflare → DNS → add TXT. Wait a few minutes, click Verify.
- [ ] Left menu → **Sitemaps** → enter `sitemap.xml` → **Submit**.
- [ ] After a few days: check **Indexing → Pages** to see how many URLs are indexed.
- [ ] Optional: use **URL Inspection** to request indexing on the 6 blog posts individually for a faster first crawl.

## 2. Bing Webmaster Tools (powers Bing + ChatGPT/AI crawlers)
- [ ] Go to https://www.bing.com/webmasters/
- [ ] Add site `https://www.repocontext.dev`, verify the same way (TXT or import from GSC).
- [ ] **Sitemaps** → submit `https://www.repocontext.dev/sitemap.xml`.

## 3. Optional extra reach
- [ ] **Yandex** (ru) — https://webmaster.yandex.com/ (submit sitemap).
- [ ] **Naver** (kr) — https://searchadvisor.naver.com/ (if targeting Korea).
- [ ] **Cloudflare Indexing** (if on Free plan) — not required.

## 4. After submission
- [ ] Resubmit the sitemap whenever you **add a new blog post** (the file auto-updates; just hit "Submit" again in GSC/Bing).
- [ ] Monitor **Search Console → Performance** weekly for impressions/clicks on "AGENTS.md generator", "CLAUDE.md private repo", etc.
- [ ] If a page shows "Discovered but not indexed" for >2 weeks, improve internal links from the homepage or blog index to it.

## Verify it worked
```
# Quick check: is the sitemap reachable?
curl -s https://www.repocontext.dev/sitemap.xml | head

# How many URLs are in it?
curl -s https://www.repocontext.dev/sitemap.xml | grep -c "<loc>"
```
Expect the count to match: homepage + all routes (pricing, docs, blog, etc.) + 6 blog posts.
