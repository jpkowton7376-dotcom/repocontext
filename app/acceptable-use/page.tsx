import type { Metadata } from "next"
import Link from "next/link"

const TITLE = "Acceptable Use Policy — RepoContext"
const DESCRIPTION =
  "The rules that govern your use of RepoContext, including what inputs and outputs are not permitted when using our AI analysis tools."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
}

export default function AcceptableUsePage() {
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
        <h1 className="text-3xl font-bold mb-2">Acceptable Use Policy</h1>
        <p className="text-muted mb-8">Last updated: September 2026</p>

        <p>
          This Acceptable Use Policy (&quot;AUP&quot;) governs your use of
          RepoContext. By using the Service you agree to follow these rules
          in addition to our{" "}
          <Link href="/terms" className="text-accent2 hover:underline">
            Terms of Service
          </Link>
          . If a conflict arises, this AUP controls for the topics it
          addresses.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          1. Prohibited Inputs
        </h2>
        <p>You may not submit, upload or analyse content that:</p>
        <ul>
          <li>
            Is illegal under the laws of the jurisdiction in which you reside
            or in which the content is hosted.
          </li>
          <li>
            Infringes the intellectual-property, privacy or publicity rights
            of any third party (for example, code copied from a private
            repository that you do not have permission to access).
          </li>
          <li>
            Contains malware, ransomware, exploit code, or other material
            intended to compromise computer systems.
          </li>
          <li>
            Is designed to generate or facilitate phishing, social
            engineering, or credential theft.
          </li>
          <li>
            Contains personal data that you are not authorised to process
            under GDPR, CCPA, PIPL or any other applicable privacy law.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">
          2. Prohibited Uses of the Service
        </h2>
        <p>You may not use RepoContext to:</p>
        <ul>
          <li>
            Reverse-engineer, decompile, or otherwise attempt to extract the
            model weights, training data, or source code of the underlying
            AI systems.
          </li>
          <li>
            Probe, scan, or load-test the Service, or attempt to bypass
            rate-limiting or quota controls.
          </li>
          <li>
            Resell, sublicense, or white-label the Service or its outputs
            without prior written permission.
          </li>
          <li>
            Use the Service to train, fine-tune, or improve any competing
            AI model or product.
          </li>
          <li>
            Circumvent the payment system, including by sharing accounts or
            exploiting free-trial quotas.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">
          3. Prohibited Outputs
        </h2>
        <p>
          While RepoContext analyses public GitHub repositories and
          generates context for your own use, you may not:
        </p>
        <ul>
          <li>
            Publish the generated AGENTS.md, CLAUDE.md, .cursorrules or
            Copilot instructions files as part of a paid product without
            verifying their accuracy and security first.
          </li>
          <li>
            Present generated content as the work of a human author in a way
          that misleads third parties.
          </li>
          <li>
            Use generated content to build automated systems that make
            decisions about individuals (employment, credit, housing)
            without human review.
          </li>
        </ul>

        <h2 className="text-xl font-bold mt-8 mb-3">
          4. Rate Limits and Fair Use
        </h2>
        <p>
          Anonymous users receive a monthly quota of free analyses. Paid
          plans are subject to fair-use thresholds designed to prevent
          automated abuse. We may throttle, suspend, or terminate accounts
          that exceed reasonable usage or that we reasonably believe are
          being used in violation of this AUP.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          5. Reporting Abuse
        </h2>
        <p>
          If you believe content analysed by RepoContext violates this AUP,
          or that another user is abusing the Service, please report it to{" "}
          <a
            href="mailto:support@repocontext.com?subject=AUP%20report"
            className="text-accent2 hover:underline"
          >
            support@repocontext.com
          </a>{" "}
          with a link and a short description. We review reports within five
          business days.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          6. Consequences of Violation
        </h2>
        <p>
          Depending on the severity of the violation, we may: issue a
          warning, temporarily suspend the offending account, terminate the
          account without refund, or refer the matter to law-enforcement
          authorities where required.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">
          7. Changes to This Policy
        </h2>
        <p>
          We may update this AUP from time to time. Material changes will be
          announced on this page and via email for signed-in users.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3">8. Contact</h2>
        <p>
          Questions about this policy? Contact us at{" "}
          <a
            href="mailto:support@repocontext.com"
            className="text-accent2 hover:underline"
          >
            support@repocontext.com
          </a>
          .
        </p>
      </article>
    </main>
  )
}
