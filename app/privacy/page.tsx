import Link from "next/link"

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted mb-8">Last updated: September 2026</p>

        <h2 className="text-xl font-bold mt-8 mb-3">1. Introduction</h2>
        <p>
          RepoContext (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
          committed to protecting your privacy. This Privacy Policy explains
          how we collect, use, and safeguard your information when you use our
          Service.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          2. Information We Collect
        </h2>

        <h3 className="text-lg font-semibold mt-6 mb-2">
          Information you provide
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account information:</strong> email address, password
            (encrypted), and any other details you provide during signup.
          </li>
          <li>
            <strong>Payment information:</strong> We do not store credit card
            details. Payments are processed by Creem, which has its own
            privacy policy.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-6 mb-2">
          Information collected automatically
        </h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Usage data:</strong> repository URLs analyzed, timestamps,
            feature usage.
          </li>
          <li>
            <strong>Log data:</strong> IP address, browser type, device
            information, pages visited.
          </li>
          <li>
            <strong>Cookies:</strong> We use cookies for authentication and
            analytics.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">3. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide, maintain, and improve the Service</li>
          <li>To process payments and manage subscriptions</li>
          <li>To authenticate users and secure accounts</li>
          <li>To send service-related communications</li>
          <li>To analyze usage patterns and optimize performance</li>
          <li>To detect and prevent fraud or abuse</li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">
          4. GitHub Data & Repository Content
        </h2>
        <p>
          When you analyze a GitHub repository, we fetch repository metadata
          and configuration files from GitHub&apos;s API. We do not store the
          full codebase. Generated output (such as AGENTS.md content) may be
          stored in your account history.
        </p>
        <p className="mt-3">
          We do not share your repository data with third parties except as
          necessary to provide the Service (e.g., sending data to our AI
          provider for processing).
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          5. Data Sharing & Third Parties
        </h2>
        <p>We share data with these third-party services:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>
            <strong>OpenAI / AI providers:</strong> Repository data is sent to
            generate AGENTS.md content.
          </li>
          <li>
            <strong>Creem:</strong> For payment processing.
          </li>
          <li>
            <strong>Supabase:</strong> For database and authentication.
          </li>
          <li>
            <strong>GitHub:</strong> To access repository data via their API.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">6. Data Retention</h2>
        <p>
          We retain your account data for as long as your account is active.
          If you delete your account, we will delete your personal data within
          30 days. Some data may be retained for legal, tax, or accounting
          purposes.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">7. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data (data portability)</li>
          <li>Opt out of marketing communications</li>
        </ul>
        <p className="mt-3">
          To exercise these rights, contact us at{" "}
          <a href="mailto:privacy@repocontext.com" className="text-accent2 hover:underline">
            privacy@repocontext.com
          </a>
          .
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">8. Security</h2>
        <p>
          We take reasonable measures to protect your data, including
          encryption in transit (HTTPS), encryption at rest, and regular
          security audits. However, no method of transmission over the Internet
          is 100% secure.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">9. Children&apos;s Privacy</h2>
        <p>
          Our Service is not intended for children under 13. We do not
          knowingly collect personal information from children under 13.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          10. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of material changes by email or through the Service.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">11. Contact</h2>
        <p>
          Questions about this policy? Reach out at{" "}
          <a href="mailto:privacy@repocontext.com" className="text-accent2 hover:underline">
            privacy@repocontext.com
          </a>
          .
        </p>

        <div className="mt-12 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>⚠️ Disclaimer:</strong> This privacy policy is a template
            and should be reviewed by a qualified lawyer before use. We do not
            provide legal advice.
          </p>
        </div>
      </article>
    </main>
  )
}
