import Link from "next/link"

export default function TermsPage() {
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

      <article className="flex-1 px-6 py-12 max-w-3xl mx-auto w-full prose prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted mb-8">Last updated: September 2026</p>

        <h2 className="text-xl font-bold mt-8 mb-3">1. Acceptance of Terms</h2>
        <p>
          By accessing or using RepoContext (&quot;the Service&quot;), you
          agree to be bound by these Terms of Service. If you do not agree to
          these terms, please do not use the Service.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">2. Description of Service</h2>
        <p>
          RepoContext is a software-as-a-service platform that analyzes GitHub
          repositories and generates context files (such as AGENTS.md) for use
          with AI coding assistants. The Service is provided &quot;as is&quot;
          and &quot;as available&quot;.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          3. User Responsibilities
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            You are responsible for maintaining the confidentiality of your
            account credentials.
          </li>
          <li>
            You agree to use the Service only for lawful purposes and in
            compliance with all applicable laws.
          </li>
          <li>
            You may not use the Service to generate content that infringes on
            intellectual property rights or violates any laws.
          </li>
          <li>
            You are responsible for all activity that occurs under your
            account.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">4. Subscription & Billing</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            Paid plans are billed on a monthly or annual basis, depending on
            your chosen plan.
          </li>
          <li>
            All payments are processed through our third-party payment
            processor (Creem).
          </li>
          <li>
            Subscriptions auto-renew unless canceled before the renewal date.
          </li>
          <li>
            No partial refunds are provided for unused time in a billing
            period. See our Refund Policy for exceptions.
          </li>
          <li>
            We reserve the right to change pricing with 30 days&apos; notice.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">5. Free Trial</h2>
        <p>
          Paid plans (Pro and Team) include 5 free uses before billing starts. You will
          not be charged until you have used all 5 free trial uses. The subscription then
          begins automatically and renews until canceled.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">6. AI-Generated Content</h2>
        <p>
          The Service uses artificial intelligence (AI) to generate content.
          AI-generated content may contain errors, inaccuracies, or
          hallucinations. You should always verify generated content against
          the actual codebase before relying on it. The Service is provided
          without warranties of any kind.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          7. Intellectual Property
        </h2>
        <p>
          You retain all rights to the content you input into the Service and
          the output generated for you. We retain ownership of the Service,
          including all software, algorithms, and branding.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, RepoContext shall not be
          liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits or revenues, whether
          incurred directly or indirectly.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">9. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the
          Service at any time, with or without cause, with or without notice.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">10. Changes to Terms</h2>
        <p>
          We may update these terms from time to time. We will notify users of
          material changes via email or through the Service.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">11. Contact</h2>
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:legal@repocontext.com" className="text-accent2 hover:underline">
            legal@repocontext.com
          </a>
          .
        </p>

        <div className="mt-12 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>⚠️ Disclaimer:</strong> These terms are a template and
            should be reviewed by a qualified lawyer before use. We do not
            provide legal advice.
          </p>
        </div>
      </article>
    </main>
  )
}
