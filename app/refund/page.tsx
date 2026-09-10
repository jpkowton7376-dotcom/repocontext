import type { Metadata } from "next"
import Link from "next/link"

const TITLE = "Refund Policy — RepoContext"
const DESCRIPTION = "RepoContext's refund policy and how to request a refund."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
}

export default function RefundPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-rule/50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center font-mono font-bold text-accent2 text-sm">
            {"{}"}
          </div>
          <span className="font-bold text-lg">RepoContext</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-muted hover:text-ink transition-colors"
        >
          ← Back
        </Link>
      </nav>

      <article className="flex-1 px-6 py-12 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
        <p className="text-muted mb-8">Last updated: September 2026</p>

        <h2 className="text-xl font-bold mt-8 mb-3">All Sales Are Final</h2>
        <p>
          All purchases of RepoContext Pro and Team plans are final. We do not
          offer refunds or exchanges for change of mind, unused usage, or
          dissatisfaction with the service after purchase. By completing your
          purchase, you acknowledge and agree that you are buying a digital
          service and that no right of withdrawal or refund applies.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">Agreement at Checkout</h2>
        <p>
          Before any payment is processed, you must check a box confirming that
          you understand and accept this no-refund policy. If you do not agree,
          do not complete the purchase.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">Free Trial</h2>
        <p>
          Pro and Team plans include free trial uses before any billing occurs.
          Please use the trial to evaluate whether RepoContext meets your needs.
          Once you upgrade to a paid plan, the purchase is final.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">Exception: Non-Delivery</h2>
        <p>
          The only exception is a material failure to deliver the service you
          paid for (for example, a confirmed technical issue on our side that
          prevents access for an extended period). In such cases, contact us
          within 14 days of the issue and we will review your request.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">Cancellation</h2>
        <p>
          For subscription plans, you may cancel at any time from your account
          settings. Cancellation stops future billing only; no refund will be
          issued for the current billing period.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">Contact</h2>
        <p>
          Questions about this policy? Email us at{" "}
          <a href="mailto:support@repocontext.com" className="text-accent2 hover:underline">
            support@repocontext.com
          </a>
          .
        </p>

        <div className="mt-12 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>⚠️ Disclaimer:</strong> This refund policy is provided as a
            template and should be reviewed by a qualified lawyer before use.
            Consumer protection laws vary by country and by U.S. state, and a
            “no refund" clause may not be enforceable in every jurisdiction.
          </p>
        </div>
      </article>
    </main>
  )
}
