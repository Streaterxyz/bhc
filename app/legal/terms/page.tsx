import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — BHC",
  description:
    "The terms governing use of the Brendon Hill Consultancy website and digital products.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="15 June 2026">
      <p>
        These terms govern your use of the Brendon Hill Consultancy
        (&ldquo;BHC&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) website at
        brendonhill.co and any digital products, training, or downloads we
        provide. By using the site or purchasing a product, you agree to these
        terms.
      </p>

      <LegalSection heading="1. Who we are">
        <p>
          Brendon Hill Consultancy is a hospitality consultancy based in
          Sydney, Australia, providing advisory services and digital products
          to hospitality operators.
        </p>
      </LegalSection>

      <LegalSection heading="2. Use of the website">
        <p>
          You may use this website for lawful purposes only. You agree not to
          misuse the site, attempt to gain unauthorised access, or interfere
          with its normal operation.
        </p>
      </LegalSection>

      <LegalSection heading="3. Digital products and licence">
        <p>
          When you purchase a digital product (such as the templates and
          spreadsheets toolkit), we grant you a personal, non-exclusive,
          non-transferable licence to use it within your own business. You may
          not resell, redistribute, sublicense, or publicly share the
          materials.
        </p>
        <p>
          Access to purchased materials is provided for your lifetime use,
          subject to these terms and our refund policy.
        </p>
      </LegalSection>

      <LegalSection heading="4. Payments">
        <p>
          Payments are processed securely by Stripe. Prices are listed in
          Australian Dollars (AUD) unless stated otherwise. By purchasing, you
          authorise us to charge your chosen payment method for the amount
          shown at checkout.
        </p>
      </LegalSection>

      <LegalSection heading="5. Refunds">
        <p>
          Purchases are covered by our{" "}
          <a
            href="/legal/refund-policy"
            className="text-[color:var(--accent)] hover:underline"
          >
            Refund Policy
          </a>{" "}
          — a 14-day, no-questions-asked guarantee. Refunds revoke access to
          the purchased materials.
        </p>
      </LegalSection>

      <LegalSection heading="6. No professional guarantee">
        <p>
          Our training, products, and advice are provided for general guidance.
          Every venue is different, and we make no guarantee of specific
          financial or operational outcomes. You remain responsible for
          decisions made in your business.
        </p>
      </LegalSection>

      <LegalSection heading="7. Intellectual property">
        <p>
          All content on this site — including text, design, templates, and
          training materials — is owned by BHC or its licensors and is
          protected by copyright. You may not copy or reproduce it except as
          permitted by your product licence.
        </p>
      </LegalSection>

      <LegalSection heading="8. Limitation of liability">
        <p>
          To the maximum extent permitted by law, BHC is not liable for any
          indirect, incidental, or consequential loss arising from your use of
          the site or products. Nothing in these terms excludes rights you
          have under the Australian Consumer Law that cannot lawfully be
          excluded.
        </p>
      </LegalSection>

      <LegalSection heading="9. Changes to these terms">
        <p>
          We may update these terms from time to time. The version in effect is
          the one published on this page at the time of your use or purchase.
        </p>
      </LegalSection>

      <LegalSection heading="10. Contact">
        <p>
          Questions about these terms? Email{" "}
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
