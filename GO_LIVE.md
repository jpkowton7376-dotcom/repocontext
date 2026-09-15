# Go Live — 上线执行清单

单一页面、按顺序勾选。前三步需在**你自己的账号**里点（我无法代操作 GitHub 可见性 / GSC / Bing / PH 账号）。

## ✅ 隐私前置检查（已通过）
- [x] README 已精简为「是什么 / 如何使用 / 本地安装」，无个人邮箱/姓名/税务信息
- [x] `CLOUDFLARE-SETUP.html` 与 `scripts/gen_domain_guide.py` 内个人邮箱已替换为品牌邮箱
- [x] 仓库无 `sk-` / `ghp_` / `AKIA` / `AIza` 等真实密钥（仅 `.env.example` 占位）

---

## 1️⃣ GitHub 设为 Public（1 分钟）
1. 打开 https://github.com/jpkowton7376-dotcom/repocontext/settings
2. 滚到底部 **Danger Zone**
3. **Change visibility** → 选 **Make public** → 输入仓库名确认
4. 去 https://github.com/jpkowton7376-dotcom/repocontext 确认 README 的 CTA 徽章正常

---

## 2️⃣ Google Search Console 提交 sitemap（约 5 分钟）
1. 打开 https://search.google.com/search-console/ （用 Google 账号登录）
2. **添加资源** → 选 **网域** → 输入 `repocontext.dev`
3. 复制 GSC 给的 **TXT 记录** → Cloudflare → 该域名 → **DNS** → 加 TXT（主机名 `@`）→ 保存
4. 回 GSC 点 **验证**
5. 左侧 **Sitemaps** → 输入 `sitemap.xml` → **提交**

---

## 3️⃣ Bing Webmaster 提交 sitemap（约 3 分钟）
1. 打开 https://www.bing.com/webmasters/
2. 用 Google 账号**直接导入**（从 GSC 拉验证 + sitemap），或手动添加 `repocontext.dev` 再验证
3. **Sitemaps** → 提交 `https://www.repocontext.dev/sitemap.xml`

---

## 4️⃣ 验证 sitemap 正常（提交后跑）
```bash
curl -s https://www.repocontext.dev/sitemap.xml | grep -c "<loc>"
```
返回数 = 首页 + 全部路由 + 6 篇博客。把数字发给协作助手确认覆盖完整。

---

## 5️⃣ Product Hunt 当天（详见 LAUNCH_CALENDAR.md）
| 时间（PT） | 动作 |
|---|---|
| 12:01 AM | PH 发布 listing |
| 12:06 AM | 发 maker comment（文案见 `PRODUCT_HUNT_LAUNCH.md` §6） |
| 1:00 AM | 发 X 推文 + 2 条 Reddit（r/cursor、r/ClaudeAI） |
| 2–3 小时内 | 逐条回复所有评论（互动量决定排名） |
| 中午 | 发西语 + 日语帖（与英文错开） |
| 收盘 | 截图最终排名 |

完整 T-7 / T-3 / T-1 准备清单见 `LAUNCH_CALENDAR.md`。

---

## 相关文档
- `PRODUCT_HUNT_LAUNCH.md` — PH 首发套件（英文 + 西/日文案 + Show HN + 截图文案）
- `LAUNCH_CALENDAR.md` — 按天执行日历
- `SITEMAP_SUBMISSION.md` (+ `.es` / `.ja` / `.zh-Hant`) — 三语 sitemap 提交指引
