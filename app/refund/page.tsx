import Link from "next/link"

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

        <h2 className="text-xl font-bold mt-8 mb-3">
          14-Day Money-Back Guarantee
        </h2>
        <p>
          We want you to be happy with RepoContext. If you&apos;re not
          satisfied with our Service for any reason, we offer a full refund
          within 14 days of your initial purchase. No questions asked.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">How to Request a Refund</h2>
        <p>
          To request a refund, email us at{" "}
          <a href="mailto:refund@repocontext.com" className="text-accent2 hover:underline">
            refund@repocontext.com
          </a>{" "}
          with:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Your account email address</li>
          <li>The subscription plan you purchased</li>
          <li>A brief reason for the refund (optional, but helps us improve)</li>
        </ul>
        <p className="mt-3">
          We will process your refund within 5-7 business days. The refund
          will be credited to your original payment method.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">What About Free Trials?</h2>
        <p>
          If you signed up for a free trial and did not cancel before the
          trial ended, you can still request a refund within 14 days of being
          charged.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">Cancellation</h2>
        <p>
          You can cancel your subscription at any time from your account
          settings or by emailing us. When you cancel:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Your access continues until the end of the billing period</li>
          <li>You will not be charged for the next billing cycle</li>
          <li>No partial refunds are provided for the current billing period</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">Annual Plans</h2>
        <p>
          For annual plans, you may request a full refund within 30 days of
          purchase. After 30 days, we offer a prorated refund for the unused
          portion of your subscription.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">Exceptions</h2>
        <p>We may refuse refunds in cases of:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Fraud or abuse of the Service</li>
          <li>Violation of our Terms of Service</li>
          <li>Multiple refund requests from the same user</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">Contact</h2>
        <p>
          Have questions about refunds? Email us at{" "}
          <a href="mailto:refund@repocontext.com" className="text-accent2 hover:underline">
            refund@repocontext.com
          </a>
          . We typically respond within 24 hours.
        </p>

        <div className="mt-12 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>⚠️ Disclaimer:</strong> This refund policy is a template
            and should be reviewed by a qualified lawyer before use. Laws vary
            by jurisdiction.
          </p>
        </div>
      </article>
    </main>
  )
}
