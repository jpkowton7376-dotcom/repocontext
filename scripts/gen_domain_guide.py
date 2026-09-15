# -*- coding: utf-8 -*-
"""Generate RepoContext custom-domain + Cloudflare setup guide PDF."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Preformatted, HRFlowable, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont

# Register a CJK font so Chinese renders without external font files.
pdfmetrics.registerFont(UnicodeCIDFont('STSong-Light'))
CJK = 'STSong-Light'
MONO = 'Courier'

styles = getSampleStyleSheet()
def mk(name, **kw):
    base = kw.pop('parent', styles['Normal'])
    return ParagraphStyle(name, parent=base, fontName=CJK, **kw)

st_title = mk('t', fontSize=21, leading=26, spaceAfter=4, textColor=colors.HexColor('#1a2230'))
st_sub   = mk('s', fontSize=10.5, leading=14, textColor=colors.HexColor('#5b6b7c'), spaceAfter=10)
st_h2    = mk('h2', fontSize=13.5, leading=18, spaceBefore=12, spaceAfter=5, textColor=colors.HexColor('#2f6bff'))
st_h3    = mk('h3', fontSize=11, leading=15, spaceBefore=7, spaceAfter=3, textColor=colors.HexColor('#1f2937'))
st_body  = mk('b', fontSize=9.6, leading=14.5, spaceAfter=5, alignment=TA_LEFT)
st_bul   = mk('bl', fontSize=9.6, leading=14, leftIndent=12, bulletIndent=2, spaceAfter=2)
st_note  = mk('n', fontSize=9, leading=13, textColor=colors.HexColor('#7a4b00'),
              backColor=colors.HexColor('#fff6e6'), borderPadding=6, spaceAfter=6, spaceBefore=2)
st_code  = ParagraphStyle('c', fontName=MONO, fontSize=8.4, leading=11.5,
                         textColor=colors.HexColor('#0b1f17'))

def P(t, s=st_body): return Paragraph(t, s)
def H2(t): return Paragraph(t, st_h2)
def H3(t): return Paragraph(t, st_h3)
def B(t): return Paragraph('• ' + t, st_bul)

def code(txt):
    t = Preformatted(txt, st_code)
    tbl = Table([[t]], colWidths=[170*mm])
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f3f5f7')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#d7dde3')),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    return tbl

def tbl(data, colw, header=True):
    t = Table(data, colWidths=colw, hAlign='LEFT')
    sstyle = [
        ('FONTNAME', (0,0), (-1,-1), CJK),
        ('FONTSIZE', (0,0), (-1,-1), 8.6),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#1a2230')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.4, colors.HexColor('#d7dde3')),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f6f8fa')]),
    ]
    if header:
        sstyle += [
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2f6bff')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), CJK),
        ]
    t.setStyle(TableStyle(sstyle))
    return t

doc = SimpleDocTemplate(
    'RepoContext-Domain-Cloudflare-Guide.pdf', pagesize=A4,
    leftMargin=20*mm, rightMargin=20*mm, topMargin=18*mm, bottomMargin=16*mm,
    title='RepoContext 自定义域名 + Cloudflare 配置指南',
    author='RepoContext'
)
E = []

E.append(P('RepoContext — 自定义域名 + Cloudflare 配置指南', st_title))
E.append(P('将 <b>repocontext.vercel.app</b> 绑定到自有域名（本文以 <b>repocontext.dev</b> 为例）', st_sub))
E.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#2f6bff')))

# 0. 前提
E.append(H2('0. 前提与整体流程'))
E.append(P('根据项目记录，应用已部署在 Vercel，每次 <font name="Courier">git push</font> 自动部署。当前线上地址为 <b>https://repocontext.vercel.app</b>。<font name="Courier">repocontext.com</font> 已被注册（停在停放页），本文改用 <b>repocontext.dev</b>（也可选 .io / .app / .net）。', st_body))
E.append(P('整体流程：', st_body))
E.append(B('购买域名（在注册商处）。'))
E.append(B('将域名接入 Cloudflare，由 Cloudflare 托管 DNS。'))
E.append(B('在 Cloudflare 添加指向 Vercel 的 DNS 记录。'))
E.append(B('在 Vercel 添加自定义域名，自动签发 SSL 证书。'))
E.append(B('（可选）在应用内补充站点 URL 等配置。'))
E.append(code(
'repocontext.vercel.app   ──(自定义域名)──▶  repocontext.dev\n'
'                                   DNS 由 Cloudflare 托管\n'
'                                   A @   → 76.76.21.21 (Vercel)\n'
'                                   CNAME www → cname.vercel-dns.com'
))

# 1. 选域名
E.append(H2('1. 选择并购买域名'))
E.append(P('推荐后缀（DNS 探测显示均可注册，最终以注册商实时结果为准）：', st_body))
E.append(tbl([
    ['后缀', '特点', '推荐度'],
    ['repocontext.dev', '开发者向；HSTS 强制 HTTPS，Vercel 原生支持', '⭐⭐⭐ 首选'],
    ['repocontext.io', '科技/创业圈最常用，好记', '⭐⭐⭐ 首选'],
    ['repocontext.app', '不错，但易与 .vercel.app 混淆', '⭐⭐'],
    ['repocontext.net / .xyz', '备选，.xyz 更便宜但略显廉价', '⭐'],
], [40*mm, 95*mm, 35*mm]))
E.append(Spacer(1, 4))
E.append(P('注册商对比：', st_h3))
E.append(tbl([
    ['注册商', '优势', '说明'],
    ['Cloudflare Registrar', '续费=批发价；购后 DNS 自动托管在 CF', '若用 CF 全套，最省心'],
    ['Porkbun / Namecheap', '首年便宜、DNS 面板好用', '购后需手动改 NS 到 CF'],
    ['阿里云 / 腾讯云', '支持 .cn，国内需实名', '若面向国内用户'],
], [42*mm, 70*mm, 58*mm]))
E.append(Spacer(1, 4))
E.append(P('购买要点：勾选 Whois 隐私保护；建议一次性买 2–3 年避免忘续费；确认显示 “Available” 再下单。', st_note))

# 2. 接入 Cloudflare
E.append(H2('2. 将域名接入 Cloudflare'))
E.append(B('注册/登录 Cloudflare 账号（免费套餐即可）。'))
E.append(B('点击 <b>Add a Site</b>，输入域名 <font name="Courier">repocontext.dev</font>，选择 <b>Free</b> 套餐。'))
E.append(B('Cloudflare 会扫描现有 DNS（新域名通常为空），直接进入下一步。'))
E.append(B('Cloudflare 给出两条 NS 记录，例如：'))
E.append(code(
'dana.ns.cloudflare.com\n'
'rick.ns.cloudflare.com        (示例，以你账号显示为准)'
))
E.append(B('到域名注册商后台，将域名的 Nameserver 改为上面这两条，删除原注册商自带的 NS。'))
E.append(B('等待生效：通常几分钟，最长 24 小时（可用 <font name="Courier">dig NS repocontext.dev</font> 验证）。'))
E.append(P('提示：若域名直接在 <b>Cloudflare Registrar</b> 购买，DNS 已自动托管在 Cloudflare，可跳过改 NS 这一步。', st_note))

# 3. Cloudflare DNS -> Vercel
E.append(H2('3. 在 Cloudflare 配置 DNS 指向 Vercel'))
E.append(P('进入 Cloudflare → 站点 → <b>DNS</b> → <b>Records</b>，添加以下两条记录：', st_body))
E.append(tbl([
    ['类型', '名称(Name)', '内容(Content)', '代理(Proxy)'],
    ['A', '@', '76.76.21.21', '开（橙云）'],
    ['CNAME', 'www', 'cname.vercel-dns.com', '开（橙云）'],
], [22*mm, 28*mm, 78*mm, 42*mm]))
E.append(Spacer(1, 4))
E.append(P('代理模式与 SSL 设置（关键，避免证书问题）：', st_h3))
E.append(B('推荐：代理保持 <b>开（橙色云朵）</b>，享受 CDN/缓存/防护。'))
E.append(B('在 Cloudflare → <b>SSL/TLS</b> → <b>Overview</b>，将加密模式设为 <b>Full (Strict)</b>。Vercel 自带有效证书，该模式下链路全程加密，不会出 SSL 错误。'))
E.append(B('若只想做纯解析、不走 Cloudflare 代理：把云朵点成 <b>灰色（DNS only）</b>，此时 SSL 模式可保持默认，由 Vercel 直接处理 HTTPS。'))
E.append(P('不要将 Cloudflare SSL 模式设为 <b>Flexible</b>：它会让 Cloudflare→Vercel 之间用 HTTP，可能触发重定向循环或 “too many redirects”。', st_note))

# 4. Vercel 加域名
E.append(H2('4. 在 Vercel 添加自定义域名'))
E.append(B('打开 vercel.com → 项目 <b>repocontext-app</b> → <b>Settings</b> → <b>Domains</b>。'))
E.append(B('输入 <font name="Courier">repocontext.dev</font>，回车；再添加 <font name="Courier">www.repocontext.dev</font>。'))
E.append(B('Vercel 自动校验 DNS，状态由 “Invalid” 变为 <b>Valid</b>（取决于 DNS 传播速度）。'))
E.append(B('如需把 www 统一跳转到裸域名：在 Domains 页把 <font name="Courier">www</font> 那条设为 <b>Redirect</b> 到根域名。'))

# 5. SSL
E.append(H2('5. SSL / HTTPS 验证'))
E.append(B('Vercel 在域名校验通过后 <b>自动签发免费 SSL 证书</b>（Universal SSL），无需手动操作。'))
E.append(B('浏览器访问 <font name="Courier">https://repocontext.dev</font>，确认地址栏出现小锁、无混合内容告警。'))
E.append(B('旧地址 <font name="Courier">repocontext.vercel.app</font> 仍正常可用，不影响部署。'))

# 6. 应用配套
E.append(H2('6. 应用内配套（可选）'))
E.append(B('在 Vercel → Settings → Environment Variables 添加：'))
E.append(code('NEXT_PUBLIC_SITE_URL = https://repocontext.dev'))
E.append(B('若 <font name="Courier">sitemap.ts</font> 需要输出绝对地址，可读取该变量拼接（非必须，Vercel 默认也能生成）。'))
E.append(B('<font name="Courier">next.config.js</font> 中 <b>/community</b>、<b>/workshop</b> 的 301 跳转保持不变，继续生效并指向 <font name="Courier">/forge</font>。'))
E.append(B('中文/多语言文案无需改动，域名切换对 i18n 无影响。'))

# 7. 排错
E.append(H2('7. 验证与排错'))
E.append(tbl([
    ['现象', '原因 / 解决'],
    ['域名一直 Invalid', 'DNS 尚未传播，等待并用 dig/nslookup 检查 A 记录是否指向 76.76.21.21'],
    ['SSL 不绿 / 证书错误', 'Cloudflare SSL 模式改为 Full (Strict)，不要 Flexible'],
    ['Too many redirects', 'Cloudflare 用了 Flexible 模式；改 Full(Strict) 并清缓存'],
    ['www 无法访问', '确认已添加 www 的 CNAME 且代理状态正确；或在 Vercel 设 Redirect'],
    ['本地 git push 失败', '若处于代理环境，给 git 配置 http.proxy（本项目曾遇 localhost:15236）'],
], [55*mm, 115*mm]))

# 8. 速查
E.append(H2('8. DNS 记录速查表'))
E.append(code(
'类型    名称      内容                     代理\n'
'A        @         76.76.21.21             开(橙)\n'
'CNAME    www       cname.vercel-dns.com    开(橙)\n'
'\n'
'Cloudflare SSL/TLS 模式: Full (Strict)\n'
'Vercel Domains: 添加 repocontext.dev + www.repocontext.dev'
))
E.append(Spacer(1, 6))
E.append(P('命令参考：', st_h3))
E.append(code(
'dig +short A repocontext.dev          # 应返回 76.76.21.21\n'
'dig NS repocontext.dev                # 应返回 *.ns.cloudflare.com\n'
'curl -I https://repocontext.dev       # 应返回 308/200，含 Location 或正常页面'
))
E.append(Spacer(1, 8))

# 9. 上线后 SEO & 性能
E.append(H2('9. 上线后 SEO & 性能（Cloudflare + Search Console）'))
E.append(P('部署完成、域名生效后，再做这几步让 Google 收录、访问更快。都在控制台 UI 完成，无需改代码。', st_body))

E.append(H3('9.1 Google Search Console 提交 sitemap'))
E.append(B('打开 search.google.com/search-console，添加资源。'))
E.append(B('推荐选 <b>Domain</b>（域名级）输入 <font name="Courier">repocontext.dev</font>，覆盖所有子域。'))
E.append(B('验证：复制 GSC 给的 TXT 记录，到 Cloudflare → DNS → Records 加一条 TXT，几分钟即验证通过。'))
E.append(B('验证后左侧 <b>Sitemaps</b> → 输入 <font name="Courier">sitemap.xml</font> → 提交。'))
E.append(B('几天后看 Coverage / 效果报告，确认页面被收录。'))
E.append(P('备选：用 "URL prefix" 方式填 https://www.repocontext.dev，可用 HTML 标签或已接入的 GA 验证。', st_note))

E.append(H3('9.2 Cloudflare 性能 & 缓存（免费）'))
E.append(B('<b>Speed → Optimization</b>：开启 Auto Minify（HTML/CSS/JS）与 Brotli（必开）。'))
E.append(B('<b>Caching → Configuration</b>：Browser Cache TTL 保持默认（尊重源站）。'))
E.append(B('<b>Cache Rules（关键）</b>：给 Next.js 静态资源设长缓存。'))
E.append(tbl([
    ['When', '设置'],
    ['URI Path 匹配 /_next/static/*', 'Edge Cache TTL = 1 year'],
    ['（同上）', 'Browser TTL = 1 year'],
    ['（同上）', 'Cache Eligibility = Eligible for cache'],
], [75*mm, 95*mm]))
E.append(Spacer(1, 4))
E.append(B('<b>Caching → Tiered Cache</b>：开启（免费，加速边缘）。'))
E.append(B('<b>SSL/TLS → Edge Certificates</b>：可开 Always Use HTTPS（Vercel 已处理重定向，二选一即可）。'))
E.append(P('⚠️ 重定向（apex→www、vercel.app→www）已在 Vercel 侧处理，不要在 Cloudflare 再设 Redirect Rules，否则可能双重跳转。', st_note))

E.append(H3('9.3 可选增强'))
E.append(B('<b>Bing Webmaster</b>：bing.com/webmasters 导入 GSC 或直接提交 sitemap（覆盖 Bing / ChatGPT 抓取）。'))
E.append(B('<b>Analytics</b>：Vercel Analytics 或 Cloudflare Web Analytics（免费）。'))
E.append(B('<b>Security</b>：Bot Fight Mode 可开，但给 /api/* 加例外，避免拦了公开 API；WAF 免费层基础防护已开。'))
E.append(B('<b>监控</b>：Sentry（错误）、Plausible / Google Analytics（流量）。'))

E.append(Spacer(1, 8))

# 10. 邮件与支付品牌化
E.append(H2('10. 邮件与支付品牌化（Cloudflare Email Routing / Resend / Creem）'))
E.append(P('让对外邮件用品牌域名、客服走品牌邮箱、支付后台通知收品牌邮箱。以下需在对应控制台 UI 完成，DNS 记录均由 Cloudflare 托管。', st_body))

E.append(H3('10.1 Cloudflare Email Routing（品牌邮箱转发）'))
E.append(B('Cloudflare → <b>Email → Email Routing</b> → 开启。'))
E.append(B('添加自定义地址，例如 <font name="Courier">support@repocontext.dev</font> → 转发到 <font name="Courier">support@repocontext.dev</font>。'))
E.append(B('确认自动添加的 DNS（CF 托管 DNS 一般自动加）：'))
E.append(tbl([
    ['类型', '名称', '内容'],
    ['MX', '@', 'route1.mx.cloudflare.net (优先级 71)'],
    ['MX', '@', 'route2.mx.cloudflare.net (优先级 72)'],
    ['MX', '@', 'route3.mx.cloudflare.net (优先级 73)'],
    ['TXT', '@', 'v=spf1 include:amazonses.com include:cloudflare.net ~all'],
], [22*mm, 28*mm, 120*mm]))

E.append(H3('10.2 Resend 验证域名（品牌 From）'))
E.append(B('Resend → <b>Domains → Add repocontext.dev</b>，按提示加 DNS（值以你账号显示为准）：'))
E.append(tbl([
    ['类型', '名称', '内容'],
    ['TXT', 'repocontext.dev', 'v=spf1 include:amazonses.com include:cloudflare.net ~all'],
    ['TXT', 'resend._domainkey', '<Resend 给的 DKIM 长串>'],
    ['TXT', '_dmarc.repocontext.dev', 'v=DMARC1; p=none;'],
], [22*mm, 48*mm, 100*mm]))
E.append(Spacer(1, 4))
E.append(B('验证通过后，在 Vercel 设环境变量 <font name="Courier">RESEND_API_KEY=re_xxx</font> 与 <font name="Courier">RESEND_FROM=RepoContext &lt;noreply@repocontext.dev&gt;</font>。'))
E.append(B('当前 lib/email.ts 中这两个变量为空时邮件为 no-op；设好后欢迎/收据/客服邮件才会真正发出，且 From 为品牌域名。'))
E.append(B('代码侧已将 <font name="Courier">SUPPORT_INBOX</font> 与页脚支持邮箱改为 <font name="Courier">support@repocontext.dev</font>（经 Email Routing 转发到你的 Gmail）。'))

E.append(H3('10.3 Creem 后台邮箱 + 触发复审'))
E.append(B('Creem Dashboard → <b>Settings</b> → 通知邮箱改为 <font name="Courier">support@repocontext.dev</font> → 保存。'))
E.append(B('若涉及收款/业务审核，补全信息后点 <b>Submit for review</b> 触发复审（纯后台操作，无代码改动）。'))
E.append(P('⚠️ Email Routing 与 Resend 共用 @ 的 SPF，上面 TXT 已把 amazonses.com（Resend）和 cloudflare.net（Email Routing）合并为一条，勿重复添加。', st_note))

E.append(Spacer(1, 8))
E.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#d7dde3')))
E.append(P('本文档由部署记录整理：Vercel 部署 + Cloudflare DNS。域名以 repocontext.dev 为例，替换为你实际购买的域名即可。', mk('foot', fontSize=8, leading=11, textColor=colors.HexColor('#8a97a5'))))

doc.build(E)
print('PDF generated: RepoContext-Domain-Cloudflare-Guide.pdf')
