/**
 * Resend-backed transactional email helpers.
 *
 * All send functions are no-ops when RESEND_API_KEY is unset, so the
 * rest of the codebase can call them unconditionally during development
 * and the production deployment only needs the env var to start
 * actually delivering mail.
 *
 * To go live:
 *   1. Sign up at https://resend.com (free tier = 3 000 emails/month).
 *   2. Add and verify your sending domain (e.g. repocontext.dev) by
 *      adding the DKIM / SPF records Resend gives you to Cloudflare DNS.
 *   3. Set RESEND_API_KEY and RESEND_FROM in Vercel env, then redeploy.
 *      RESEND_FROM example: "RepoContext <noreply@repocontext.dev>".
 */
import { Resend } from "resend"
import { SITE_URL } from "./site-url"

const apiKey = process.env.RESEND_API_KEY?.trim() || ""
const fromAddress =
  process.env.RESEND_FROM?.trim() || "RepoContext <onboarding@resend.dev>"

const resend = apiKey ? new Resend(apiKey) : null

/** True when RESEND_API_KEY is set and Resend calls will actually deliver. */
export const emailConfigured = !!resend

/** A no-throw wrapper around resend.emails.send so callers can fire-and-forget. */
async function send(args: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY is not set — skipping send to",
      args.to,
    )
    return { ok: false, error: "email service not configured" }
  }
  if (!args.to) return { ok: false, error: "missing recipient" }

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    })
    if (error) {
      console.error("[email] resend error:", error)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (err: any) {
    console.error("[email] unexpected error:", err)
    return { ok: false, error: err?.message || "send failed" }
  }
}

/* ────────────────────────────────────────────────────────────────────────────
 * Branded layout — shared HTML wrapper that gives every transactional
 * email the same typography and footer.
 * ──────────────────────────────────────────────────────────────────────────── */
function layout(contentHtml: string, preheader?: string): string {
  const siteUrl =
    SITE_URL
  const supportEmail = "jpkowton@gmail.com"
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
${
  preheader
    ? `<meta name="description" content="${preheader.replace(/"/g, "&quot;")}" />`
    : ""
}
<title>RepoContext</title>
</head>
<body style="margin:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a2230;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f6f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background:#ffffff;border:1px solid #e6eaf0;">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #e6eaf0;">
              <a href="${siteUrl}" style="text-decoration:none;color:#1a2230;font-weight:600;font-size:18px;letter-spacing:-0.01em;">RepoContext</a>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#fafbfc;border-top:1px solid #e6eaf0;font-size:12px;color:#64707f;line-height:1.6;">
              <div style="margin-bottom:6px;">RepoContext — AI-ready context for any GitHub repository.</div>
              <div>Need help? Reply to this email or write to <a href="mailto:${supportEmail}" style="color:#2b3be0;text-decoration:none;">${supportEmail}</a>.</div>
              <div style="margin-top:12px;"><a href="${siteUrl}/acceptable-use" style="color:#64707f;text-decoration:underline;">Acceptable Use Policy</a> · <a href="${siteUrl}/privacy" style="color:#64707f;text-decoration:underline;">Privacy</a></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/* ────────────────────────────────────────────────────────────────────────────
 * Public send functions
 * ──────────────────────────────────────────────────────────────────────────── */

export async function sendWelcomeEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const siteUrl =
    SITE_URL
  const html = layout(
    `
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;line-height:1.3;">Welcome to RepoContext</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1a2230;">
        Thanks for signing up. You can now generate an
        <code style="font-family:'IBM Plex Mono',monospace;background:#f0f2f5;padding:1px 6px;border-radius:3px;">AGENTS.md</code>,
        CLAUDE.md, Cursor rules and Copilot instructions for any public GitHub repository in under a minute.
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#1a2230;">
        Paste a repository URL below to get started:
      </p>
      <p style="margin:0 0 24px;">
        <a href="${siteUrl}" style="display:inline-block;padding:12px 22px;background:#2b3be0;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">Analyze your first repository →</a>
      </p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#64707f;">
        You start with <strong>5 free analyses per month</strong> and <strong>2 Pro trial analyses</strong> that use the premium model. No credit card required.
      </p>
    `,
    "Welcome to RepoContext — start analyzing GitHub repos for free.",
  )
  return send({
    to: email,
    subject: "Welcome to RepoContext",
    html,
    text: `Welcome to RepoContext. You start with 5 free analyses per month. Get started: ${siteUrl}`,
  })
}

export async function sendPaymentReceiptEmail(args: {
  email: string
  productName: string
  amount: string
  currency?: string
  invoiceUrl?: string
}): Promise<{ ok: boolean; error?: string }> {
  const { email, productName, amount, currency, invoiceUrl } = args
  const siteUrl =
    SITE_URL
  const amountLine = currency
    ? `${currency} ${amount}`
    : amount

  const html = layout(
    `
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;line-height:1.3;">Thanks — your Pro plan is active</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1a2230;">
        Your payment of <strong>${amountLine}</strong> for the <strong>${productName}</strong> plan was successful.
        You now have unlimited analyses, access to private repositories, and the premium LLM model.
      </p>
      ${
        invoiceUrl
          ? `<p style="margin:0 0 24px;font-size:14px;">
              <a href="${invoiceUrl}" style="color:#2b3be0;text-decoration:underline;">Download your invoice (PDF) →</a>
            </p>`
          : ""
      }
      <p style="margin:0 0 24px;">
        <a href="${siteUrl}/dashboard" style="display:inline-block;padding:12px 22px;background:#2b3be0;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">Go to your dashboard →</a>
      </p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#64707f;">
        You can manage or cancel your subscription at any time from
        <a href="${siteUrl}/dashboard" style="color:#2b3be0;text-decoration:underline;">your dashboard</a> →
        Quick actions → Manage subscription.
      </p>
    `,
    "Your RepoContext Pro plan is now active.",
  )
  return send({
    to: email,
    subject: "Thanks — your RepoContext Pro plan is active",
    html,
    text: `Your RepoContext ${productName} plan is now active. Amount: ${amountLine}. Manage at: ${siteUrl}/dashboard`,
  })
}

export async function sendPaymentFailedEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const siteUrl =
    SITE_URL
  const html = layout(
    `
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;line-height:1.3;">We couldn't process your latest payment</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1a2230;">
        Your most recent payment for RepoContext Pro did not go through. Your access has been moved to the free tier in the meantime.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${siteUrl}/dashboard" style="display:inline-block;padding:12px 22px;background:#2b3be0;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">Update payment method →</a>
      </p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#64707f;">
        If you believe this is in error, reply to this email and we'll sort it out.
      </p>
    `,
    "We couldn't process your RepoContext payment.",
  )
  return send({
    to: email,
    subject: "Action needed — your RepoContext payment didn't go through",
    html,
    text: `Your RepoContext payment didn't go through. Update your payment method at ${siteUrl}/dashboard`,
  })
}

/* ────────────────────────────────────────────────────────────────────────────
 * Support inbox
 * ──────────────────────────────────────────────────────────────────────────── */

/** Where inbound customer-service messages are delivered. */
export const SUPPORT_INBOX = "jpkowton@gmail.com"

/** Escapes user-controlled text so it cannot break out of the HTML body. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/**
 * Delivers a message typed into the on-site support widget to the support
 * inbox. `replyTo` is the visitor's address so a plain "reply" in any mail
 * client goes straight back to them.
 */
export async function sendSupportNotificationEmail(args: {
  message: string
  replyTo?: string
  page?: string
}): Promise<{ ok: boolean; error?: string }> {
  const { message, replyTo, page } = args
  const html = layout(
    `
      <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;line-height:1.3;">New support message</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#1a2230;">
        <tr><td style="padding:2px 12px 2px 0;color:#64707f;">From</td><td>${esc(replyTo || "anonymous visitor")}</td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#64707f;">Page</td><td>${esc(page || "/")}</td></tr>
        <tr><td style="padding:2px 12px 2px 0;color:#64707f;">Received</td><td>${new Date().toUTCString()}</td></tr>
      </table>
      <div style="margin:20px 0 0;padding:16px;background:#f5f6f8;border:1px solid #e6eaf0;font-size:14px;line-height:1.6;white-space:pre-wrap;word-break:break-word;">${esc(message)}</div>
    `,
    "New RepoContext support message",
  )
  return send({
    to: SUPPORT_INBOX,
    subject: `[RepoContext support] ${(message || "").slice(0, 60)}`,
    html,
    text: `New support message from ${replyTo || "anonymous visitor"}:\n\n${message}`,
  })
}

/**
 * Acknowledges a support message so the visitor knows it was actually
 * delivered rather than swallowed by the widget.
 */
export async function sendSupportAckEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const siteUrl =
    SITE_URL
  const html = layout(
    `
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;line-height:1.3;">We got your message</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1a2230;">
        Thanks for reaching out. Your message reached the RepoContext support inbox and we'll reply
        to this address, usually within one business day.
      </p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#64707f;">
        In the meantime the <a href="${siteUrl}/docs" style="color:#2b3be0;text-decoration:underline;">docs</a>
        and <a href="${siteUrl}/how-to-use" style="color:#2b3be0;text-decoration:underline;">how-to guide</a>
        answer most questions.
      </p>
    `,
    "We received your RepoContext support message.",
  )
  return send({
    to: email,
    subject: "We got your message — RepoContext support",
    html,
    text: `We received your support message and will reply within one business day. Docs: ${siteUrl}/docs`,
  })
}

/** Confirms a waitlist signup and tells the user what happens next. */
export async function sendWaitlistConfirmEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const siteUrl =
    SITE_URL
  const html = layout(
    `
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;line-height:1.3;">You're on the list</h1>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1a2230;">
        Thanks for joining the RepoContext waitlist. You'll be the first to hear when
        monorepo support, custom AI agents, GitLab &amp; Bitbucket, and team collaboration ship.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${siteUrl}" style="display:inline-block;padding:12px 22px;background:#2b3be0;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.02em;">Keep exploring RepoContext →</a>
      </p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:#64707f;">
        You can unsubscribe at any time by replying to this email.
      </p>
    `,
    "You're on the RepoContext waitlist.",
  )
  return send({
    to: email,
    subject: "You're on the RepoContext waitlist",
    html,
    text: `You're on the RepoContext waitlist. We'll email you when new features ship. ${siteUrl}`,
  })
}
