import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

type Props = {
  title: string;
  lastUpdated: string;
  children: ReactNode;
};

/**
 * Shared shell for the legal pages (privacy, terms, refund). Keeps the
 * dark BHC theme, a constrained reading column, and consistent typography
 * across all three.
 */
export function LegalPage({ title, lastUpdated, children }: Props) {
  return (
    <>
      <Header />
      <main className="px-6 lg:px-12 pt-32 lg:pt-40 pb-24">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-5">Legal</p>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-sm text-fg-muted mb-12 lg:mb-16">
            Last updated {lastUpdated}
          </p>

          <div className="legal-prose space-y-6 text-fg-secondary leading-relaxed">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/** Section heading inside a legal page. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="pt-6">
      <h2 className="text-xl lg:text-2xl font-extrabold tracking-tight text-fg-primary mb-4">
        {heading}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
