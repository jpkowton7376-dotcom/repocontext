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

### 🔴 第三阶段：支付系统（上线前 1 周）

**方案 A：Paddle / Lemon Squeezy（推荐新手）**
- 优点：不用管税务，不用美国公司
- 手续费：5% + $0.50/笔
- 注册地址：https://paddle.com/ 或 https://www.lemonsqueezy.com/

**方案 B：Creem（无公司主体推荐）**
- 优点：个人即可注册、费率低（约 3%）、Merchant of Record 自动代缴 VAT
- 缺点：需自行申报境外收入（提现受每年 5 万美元外汇额度限制）

**Creem 配置步骤：**

1. [ ] 注册 Creem 账号：https://www.creem.io/
2. [ ] 配置 `CREEM_API_KEY`
3. [ ] 创建两个订阅产品（Pro $9/mo, Team $29/mo）
4. [ ] 把 Product ID 填到 `CREEM_PRODUCT_PRO` 和 `CREEM_PRODUCT_TEAM`
5. [ ] 配置 Webhook：
   - Endpoint URL: `https://你的域名/api/creem/webhook`
   - 监听事件：`checkout.completed`, `subscription.paid`, `subscription.canceled`
6. [ ] 配置 `CREEM_WEBHOOK_SECRET`
7. [ ] 测试支付流程（`CREEM_TEST_MODE=true` 走 test-api.creem.io）

### 🟣 第四阶段：域名 & 部署（上线前 3 天）

**域名购买：**
- [ ] 购买域名 `repocontext.dev`（repocontext.com 已被第三方持有，勿再尝试）
- [ ] 在 Namecheap / GoDaddy / Cloudflare 购买
- [ ] 配置 DNS 解析

**Vercel 部署：**
- [ ] 把代码推到 GitHub
- [ ] 登录 https://vercel.com/，Import 仓库
- [ ] 在 Environment Variables 里填入所有环境变量
- [ ] 点 Deploy，等构建完成
- [ ] 绑定自定义域名
- [ ] 开启 HTTPS（Vercel 自动配置）

### 🔵 第五阶段：法律合规（上线前 1 天）

- [ ] Terms of Service 页面已上线（/terms）
- [ ] Privacy Policy 页面已上线（/privacy）
- [ ] Refund Policy 页面已上线（/refund）
- [ ] Footer 里有法律页面链接
- [ ] 注册流程里有"同意条款"的文案
- [ ] ⚠️ 建议：找律师看一下法律页面模板

### ⚪ 第六阶段：上线前最后检查

- [ ] 用手机测试一遍（移动端适配）
- [ ] 测试注册 → 验证邮箱 → 登录 → 使用 → 支付 → 取消 全流程
- [ ] 404 页面正常
- [ ] 错误提示友好
- [ ] 加载速度可以接受（< 3 秒）
- [ ] Google Analytics / Plausible 统计代码加上
- [ ] 客服邮箱能正常收信

---

## 🏢 公司设立 & 税务（做欧美市场）

### 推荐方案：美国怀俄明州 LLC

**为什么选怀俄明：**
- 没有州所得税、没有特许经营税
- 注册成本低（$100-300）
- 隐私保护好（成员信息不公开）
- 每年维护费：州政府 $60 + 注册代理人 $50-150

**注册方式：**
- Northwest Registered Agent（推荐，服务好）
- Incfile（便宜）
- Wyoming Registered Agent

一般 $300-500 全包，一周左右搞定。

### 税务简要说明

| 税种 | 说明 |
|------|------|
| 联邦所得税 | LLC 是 pass-through，利润算个人收入 |
| 自雇税 | 15.3%（社保+医保） |
| 州税 | 怀俄明 0% |
| 销售税 | SaaS 产品大部分州不需要收 |
| VAT/GST | 欧洲客户需要收，用 Creem（MoR）自动代缴 |

> ⚠️ 以上是简化说明，具体请咨询专业会计师。

### 收款方案对比

| 方案 | 手续费 | 适合阶段 | 推荐度 |
|------|--------|----------|--------|
| Creem（个人可注册） | 约 3% | MVP 到 $10k MRR | ⭐⭐⭐⭐⭐ |
| Paddle / Lemon Squeezy | 5% + $0.50 | MVP 到 $10k MRR | ⭐⭐⭐⭐ |
| Stripe + 境外公司 | 2.9% + $0.30 | $10k MRR 以上 | ⭐⭐⭐⭐ |

**建议：用 Creem 起步（无需公司、个人可注册、自动代缴 VAT），月收入过 $10k 再考虑注册境外公司切 Stripe。**

---

## 🧪 测试验证清单

### 功能测试

- [ ] 首页正常显示
- [ ] 输入有效 GitHub 仓库 → 能生成结果
- [ ] 输入无效仓库 → 有友好的错误提示
- [ ] 结果页质量分正确显示
- [ ] Evidence 面板能展开/收起
- [ ] 复制按钮能用
- [ ] 下载按钮能用
- [ ] 注册功能正常
- [ ] 登录功能正常
- [ ] 退出登录正常
- [ ] Dashboard 显示正确

### 兼容性测试

- [ ] Chrome 正常
- [ ] Safari 正常
- [ ] Firefox 正常
- [ ] 手机端正常
- [ ] 平板正常

### 性能测试

- [ ] 首页加载 < 2 秒
- [ ] 分析一次 < 10 秒（普通项目）
- [ ] 没有明显的布局跳动（CLS）

### 安全测试

- [ ] API 不能被无限制调用（有 rate limit）
- [ ] 用户数据隔离（A 看不到 B 的数据）
- [ ] 密码加密存储
- [ ] 敏感 key 不暴露到前端

---

## 📈 上线后的监控

- **错误监控：** Sentry（免费层够用）
- **分析统计：** Plausible / Google Analytics
- **用户反馈：** 加一个反馈表单或邮箱
- **性能监控：** Vercel Analytics

---

## ❓ 常见问题

**Q: 没有 Supabase 能用吗？**
A: 能。首页和分析功能不需要登录，直接就能用。用户系统是可选的。

**Q: 没有 Creem 能用吗？**
A: 能。定价页可正常显示；本地开发点支付会直接跳成功页演示流程，生产环境才需要配置 Creem 才能真实收款。

**Q: 怎么改价格？**
A: 分两步，顺序不能反：先在 Creem Dashboard 里改产品实际收费（真正扣款金额由 Creem 后台的 product 决定，代码里定义不了），再把 `app/pricing/page.tsx` 的展示数字改成一致。只改页面数字会造成"页面显示 \$9、实际扣 \$19"。

**Q: 怎么加新的输出格式（比如 CLAUDE.md）？**
A: 在 `lib/generator.ts` 里加一个生成函数，然后在结果页加一个切换 Tab。

**Q: 上线成本大概多少？**
A: MVP 阶段几乎免费：
- Vercel Hobby：免费
- Supabase Free：免费
- Creem：按交易收费，没交易不花钱
- 域名：$10-15/年
- 合计：~$10/月起

---

## 📝 License

MIT
