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
 *   2. Add and verify your sending domain (e.g. repocontext.com).
 *   3. Set RESEND_API_KEY and RESEND_FROM in Vercel env, then redeploy.
 *      RESEND_FROM example: "RepoContext <noreply@repocontext.com>".
 */
import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY?.trim() || ""
const fromAddress =
  process.env.RESEND_FROM?.trim() || "RepoContext <onboarding@resend.dev>"

const resend = apiKey ? new Resend(apiKey) : null

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
    process.env.NEXT_PUBLIC_SITE_URL || "https://repocontext.vercel.app"
  const supportEmail = "support@repocontext.com"
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
    process.env.NEXT_PUBLIC_SITE_URL || "https://repocontext.vercel.app"
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
    process.env.NEXT_PUBLIC_SITE_URL || "https://repocontext.vercel.app"
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
    process.env.NEXT_PUBLIC_SITE_URL || "https://repocontext.vercel.app"
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
