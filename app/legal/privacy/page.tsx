import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — BHC",
  description:
    "How Brendon Hill Consultancy collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="15 June 2026">
      <p>
        Brendon Hill Consultancy (&ldquo;BHC&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;) respects your privacy. This policy explains what
        personal information we collect, how we use it, and the choices you
        have. It is written to align with the Australian Privacy Principles
        under the Privacy Act 1988 (Cth).
      </p>

      <LegalSection heading="Information we collect">
        <p>We collect:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Contact details</strong> — your name and email address when
            you register for the free training or purchase a product.
          </li>
          <li>
            <strong>Purchase information</strong> — records of products you buy.
            Card details are handled directly by Stripe; we never see or store
            your full card number.
          </li>
          <li>
            <strong>Usage data</strong> — basic analytics about how you use the
            site (pages viewed, training video progress) to improve our content.
          </li>
          <li>
            <strong>Technical data</strong> — approximate location (country) and
            referral source, used for attribution and analytics.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <ul className="list-disc pl-6 space-y-2">
          <li>To deliver the free training and any products you purchase.</li>
          <li>To send transactional emails (receipts, download links).</li>
          <li>
            To send marketing and nurture emails, where you&apos;ve opted in.
            You can unsubscribe at any time.
          </li>
          <li>To understand and improve our content and offers.</li>
          <li>To comply with our legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Third-party services we use">
        <p>
          We share data only with the service providers needed to run the
          business:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Stripe</strong> — payment processing.
          </li>
          <li>
            <strong>Resend</strong> — transactional email delivery.
          </li>
          <li>
            <strong>Loops</strong> — marketing email sequences.
          </li>
          <li>
            <strong>Cloudflare</strong> — video hosting and file delivery.
          </li>
          <li>
            <strong>Neon</strong> — secure database hosting.
          </li>
          <li>
            <strong>Vercel</strong> — website hosting.
          </li>
          <li>
            <strong>Google Analytics &amp; PostHog</strong> — usage analytics.
          </li>
        </ul>
        <p>
          We do not sell your personal information to anyone.
        </p>
      </LegalSection>

      <LegalSection heading="Cookies and analytics">
        <p>
          We use cookies and similar technologies to keep you signed in to the
          training and to understand site usage. You can control cookies through
          your browser settings; disabling them may affect site functionality.
        </p>
      </LegalSection>

      <LegalSection heading="Data retention and security">
        <p>
          We keep your information only as long as needed to provide our
          services and meet legal obligations. We use reputable providers with
          industry-standard security to protect your data, though no method of
          transmission over the internet is completely secure.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You can request access to, correction of, or deletion of your
          personal information at any time. To do so, or to unsubscribe from
          marketing, email{" "}
          <a
            href="mailto:brendon@brendonhill.co"
            className="text-[color:var(--accent)] hover:underline"
          >
            brendon@brendonhill.co
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          We may update this policy from time to time. The current version is
          always published on this page.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          For any privacy questions, contact{" "}
          <a
            href="mailto:brendon@brendonhill.co"
            className="text-[color:var(--accent)] hover:underline"
          >
            brendon@brendonhill.co
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
