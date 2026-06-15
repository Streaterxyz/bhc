import type { Metadata } from "next";

import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy — BHC",
  description:
    "Our 14-day, no-questions-asked refund policy for digital products.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" lastUpdated="15 June 2026">
      <p>
        We want you to feel confident purchasing from Brendon Hill Consultancy.
        If a digital product isn&apos;t right for you, here&apos;s exactly how
        our refunds work.
      </p>

      <LegalSection heading="14-day, no-questions-asked guarantee">
        <p>
          You can request a full refund within <strong>14 days</strong> of your
          purchase date, for any reason. You don&apos;t need to justify your
          request — if it&apos;s not for you, we&apos;ll refund you.
        </p>
      </LegalSection>

      <LegalSection heading="How to request a refund">
        <p>
          Email{" "}
          <a
            href="mailto:brendon@brendonhill.co?subject=Refund%20request"
            className="text-[color:var(--accent)] hover:underline"
          >
            brendon@brendonhill.co
          </a>{" "}
          from the email address you used at checkout, with the subject
          &ldquo;Refund request&rdquo;. We&apos;ll process it promptly.
        </p>
      </LegalSection>

      <LegalSection heading="Processing time">
        <p>
          Approved refunds are issued to your original payment method within{" "}
          <strong>5 business days</strong> via Stripe. Depending on your bank,
          it may take a few additional days to appear on your statement.
        </p>
      </LegalSection>

      <LegalSection heading="Access after a refund">
        <p>
          Because our products are digital, access to the purchased
          downloads and any associated materials is{" "}
          <strong>revoked once a refund is issued</strong>. You agree not to
          retain, use, or distribute the materials after a refund.
        </p>
      </LegalSection>

      <LegalSection heading="One refund per customer">
        <p>
          The no-questions-asked guarantee applies to{" "}
          <strong>one refund per customer</strong>. This keeps the policy
          generous for genuine customers while preventing abuse.
        </p>
      </LegalSection>

      <LegalSection heading="Questions">
        <p>
          If anything about this policy is unclear, email{" "}
          <a
            href="mailto:brendon@brendonhill.co"
            className="text-[color:var(--accent)] hover:underline"
          >
            brendon@brendonhill.co
          </a>{" "}
          before purchasing and we&apos;ll happily clarify.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
