# RepoContext

**Turn any GitHub repository into AI-ready context — generate verified `AGENTS.md`, `CLAUDE.md`, and Cursor rules in seconds.**

[![Try it free](https://img.shields.io/badge/Try%20it%20free-repocontext.dev-blue)](https://www.repocontext.dev)

RepoContext analyzes your repository's real structure — framework, package manager, test and build commands, source layout — and produces context files your AI coding agents can actually act on. Every line is verified against the codebase, not copied from a generic template.

👉 **[repocontext.dev](https://www.repocontext.dev)** · Free tier, no credit card required.

---

> The sections below are the original Chinese launch & ops guide (开发文档). Most users should just head to **[repocontext.dev](https://www.repocontext.dev)**.

# RepoContext — 上线完全指南

> Turn your codebase into AI-ready context.

RepoContext 是一个分析 GitHub 仓库、自动生成 AGENTS.md 的 SaaS 工具。

---

## 🚀 快速启动（本地开发）

### 1. 安装依赖

```bash
cd repocontext-app
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 为 `.env.local`，至少配置前两个：

```env
# 基础（这两个先配上就能跑）
OPENAI_API_KEY=sk-xxx        # 可选，用于 LLM 优化生成质量
GITHUB_TOKEN=ghp-xxx         # 建议配，避免 API 频率限制
OPENAI_MODEL=gpt-4o-mini

# 用户系统（Supabase — 上线前再配）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# 支付（Creem — 无需公司主体，个人可注册）
CREEM_API_KEY=
CREEM_WEBHOOK_SECRET=
CREEM_TEST_MODE=true
CREEM_PRODUCT_PRO=prod_xxx
CREEM_PRODUCT_TEAM=prod_xxx

# 应用配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 启动

```bash
npm run dev
```

打开 http://localhost:3000

---

## 📁 项目结构

```
repocontext-app/
├── app/
│   ├── page.tsx                  # 首页
│   ├── result/page.tsx           # 分析结果页（本地历史恢复）
│   ├── result/[id]/page.tsx      # 公开分享结果页
│   ├── pricing/page.tsx          # 定价页
│   ├── login/page.tsx            # 登录页
│   ├── signup/page.tsx           # 注册页
│   ├── dashboard/page.tsx        # 用户控制台（用量 / API key / 订阅）
│   ├── docs/page.tsx             # 产品文档
│   ├── developers/page.tsx       # 公开 API 文档
│   ├── templates/page.tsx        # 提示词与模板库
│   ├── ai-tools/page.tsx         # AI 工具目录（SEO）
│   ├── changelog/page.tsx        # 更新日志 + RSS
│   ├── terms/ privacy/ refund/ acceptable-use/   # 法务页
│   ├── api/
│   │   ├── analyze/route.ts      # 浏览器端分析入口
│   │   ├── v1/analyze/route.ts   # 公开 REST API（API key + 限流）
│   │   ├── api-keys/             # API key 增删
│   │   ├── share/route.ts        # 分享链接读写
│   │   ├── support/route.ts      # 客服消息
│   │   ├── waitlist/route.ts     # waitlist 邮箱收集
│   │   ├── trial/route.ts        # 匿名试用计数
│   │   ├── creem/                # checkout / webhook / portal
│   │   ├── account/delete/       # GDPR 删号
│   │   └── email/welcome/        # 欢迎邮件
│   ├── i18n/                     # en / es / ja / zh-Hant 词典
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── SiteNav.tsx               # 全站导航
│   ├── CustomerServiceWidget.tsx # 客服浮窗（真实发信）
│   ├── CookieConsent.tsx         # Cookie 同意
│   └── LanguageProvider.tsx      # 多语言
├── lib/
│   ├── github.ts                 # GitHub API 工具
│   ├── scanner.ts                # 仓库扫描器
│   ├── generator.ts              # AGENTS.md / CLAUDE.md / Cursor / Copilot 生成
│   ├── analyze-pipeline.ts       # 扫描 → 生成 → LLM 编排
│   ├── llm.ts                    # LLM 优化
│   ├── api-keys.ts               # key 生成/校验 + 每分钟限流
│   ├── recent-analyses.ts        # 未登录用户的本地分析历史
│   ├── trial.ts                  # 试用额度
│   ├── supabase.ts / supabase-server.ts
│   ├── creem.ts                  # Creem 配置
│   ├── email.ts                  # Resend 事务邮件
│   └── templates.ts / ai-tools.ts / changelog-data.ts
├── supabase/                     # 建表 SQL（逐个在 SQL Editor 执行）
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## ✅ 上线前检查清单

按顺序来，打勾完成：

### 🟢 第一阶段：基础功能验证（现在就能做）

- [ ] `npm run dev` 能正常启动
- [ ] 首页能正常显示
- [ ] 输入 `psf/requests` 能生成 AGENTS.md
- [ ] 结果页能正常显示质量分和 Evidence
- [ ] 复制 / 下载按钮能用
- [ ] 测试 3-5 个不同类型的项目（Python / JS / Go / Rust）
- [ ] 生成的命令准确率 ≥ 80%
- [ ] 没有明显的幻觉（编造不存在的依赖）

### 🟡 第二阶段：用户系统（上线前 2 周）

**注册 Supabase：** https://supabase.com/ （免费层够用）

- [ ] 创建 Supabase 项目
- [ ] 配置 `NEXT_PUBLIC_SUPABASE_URL`
- [ ] 配置 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] 配置 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 在 Supabase SQL Editor 里运行建表 SQL（见下方）
- [ ] 测试注册功能（邮箱 + 密码）
- [ ] 测试登录功能
- [ ] 测试退出登录
- [ ] Dashboard 页面能正常显示

**Supabase 建表 SQL（复制到 SQL Editor 运行）：**

```sql
-- 用户资料表
create table profiles (
  id uuid references auth.users primary key,
  email text unique,
  plan text default 'free',
  creem_customer_id text,
  creem_subscription_id text,
  analyses_today integer default 0,
  total_analyses integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 分析历史表
create table analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  repo_url text not null,
  repo_name text,
  quality_score integer,
  agents_md text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 开启 RLS
alter table profiles enable row level security;
alter table analyses enable row level security;

-- 用户只能看自己的数据
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can view own analyses"
  on analyses for select
  using (auth.uid() = user_id);

-- 自动创建 profile
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

上面的 SQL 也可以用 `supabase/01_init.sql`（同一份内容）。

**其余表**都在 `supabase/` 下，各自是一个独立文件，用到哪个功能就跑哪个
（所有相关代码都会在这些表缺失时优雅降级，不会出现 500）：

| 文件 | 用途 | 不跑会怎样 |
| --- | --- | --- |
| `01_init.sql` | profiles / analyses + 触发器 | 登录与历史记录不可用 |
| `add_creem_columns.sql` | 订阅相关字段 | 支付回调无法升级套餐 |
| `api_keys.sql` | 公开 API 的 key | Dashboard 无法创建 API key |
| `shared_analyses.sql` | 分享链接 | 分享按钮返回 503 |
| `api_key_rate_buckets.sql` | API 每分钟限流 | 限流不生效（fail open，只告警） |
| `support_messages.sql` | 客服消息留档 | 客服消息仍能发邮件，只是不入库 |
| `waitlist.sql` | waitlist 邮箱 | 邮箱只能进日志，不入库 |

---

## 📝 License

MIT
