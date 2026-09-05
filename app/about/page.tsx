import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CTABlock } from "@/components/marketing/CTABlock";
import { JsonLd } from "@/components/seo/JsonLd";
import { personSchema, organizationSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About Brendon Hill — Hospitality Consultant, Sydney — BHC",
  description:
    "Brendon Hill is a Sydney hospitality consultant and founder of Brendon Hill Consultancy (BHC). Systems used across 100+ venues — including a documented $393,600 annual profit turnaround.",
  alternates: { canonical: "https://brendonhill.co/about" },
  openGraph: {
    title: "About Brendon Hill — Hospitality Consultant, Sydney",
    description:
      "Founder of BHC. Strategy, operations and beverage systems used across 100+ venues.",
    type: "profile",
  },
};

/** Proof points — every number here is published in a case study on this site. */
const PROOF = [
  { value: "100+", label: "Venues using BHC systems" },
  { value: "$393,600", label: "Annual turnaround at one venue — from −10% profit" },
  { value: "15%+", label: "Sustained MoM beverage margin growth, club resort" },
  { value: "8", label: "Published case studies across Greater Sydney" },
];

const EXPERTISE = [
  "Venue profitability audits and turnarounds",
  "Beverage strategy, menu engineering and margin work",
  "Operational systems — rosters, workflows, supplier management",
  "Team training, service standards and leadership development",
  "Pre-opening support and concept development",
  "Group-wide standards for multi-venue operators",
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* ────────────────── Hero ────────────────── */}
        <section className="bg-bg-base px-6 lg:px-12 pt-32 lg:pt-40 pb-16 lg:pb-24">
          <div className="max-w-[1440px] mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-20 items-center">
            <div>
              <p className="eyebrow mb-5">About</p>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
                Brendon Hill
              </h1>
              <p className="text-lg text-fg-secondary max-w-xl mb-6">
                Hospitality consultant and founder of Brendon Hill Consultancy
                — a Sydney-based, people-led consultancy helping venues lift
                profit through strategy, operational systems, beverage
                programs and team development.
              </p>
              <p className="text-fg-tertiary max-w-xl">
                Brendon built BHC out of the operator&apos;s seat: 80-hour
                weeks, venues that looked successful from the street and bled
                cash in the office. The systems that fixed his own venues —
                rosters, menus, stock, suppliers, service — are now used
                across more than one hundred venues, from neighbourhood bars
                to some of Sydney&apos;s most recognised hospitality groups.
              </p>
            </div>
            <div className="relative aspect-square max-w-md w-full mx-auto lg:mx-0 rounded-2xl overflow-hidden border border-[color:var(--border-subtle)]">
              <Image
                src="/headshots/Brendon.png"
                alt="Brendon Hill — hospitality consultant, Sydney"
                fill
                sizes="(min-width: 1024px) 420px, 90vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        {/* ────────────────── Proof strip ────────────────── */}
        <section
          aria-label="Results"
          className="bg-bg-elevated border-t border-b border-[color:var(--border-subtle)] px-6 lg:px-12 py-10"
        >
          <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
            {PROOF.map((item) => (
              <div key={item.label}>
                <p className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[color:var(--accent)] mb-1">
                  {item.value}
                </p>
                <p className="text-sm text-fg-tertiary leading-snug">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ────────────────── What Brendon does ────────────────── */}
        <section className="bg-bg-base px-6 lg:px-12 py-20 lg:py-28">
          <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <p className="eyebrow mb-5">The Work</p>
              <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-6">
                Profit lives in the details.
              </h2>
              <p className="text-fg-secondary max-w-xl mb-4">
                Most struggling venues don&apos;t have a sales problem — they
                have quiet leaks in the roster, the menu, the stock room and
                the supplier invoices. BHC&apos;s work is finding those leaks,
                putting a dollar figure on them, and building the systems and
                the people to plug them permanently.
              </p>
              <p className="text-fg-secondary max-w-xl">
                Engagements run from single-venue turnarounds to group-wide
                standards for multi-venue operators. The results are
                published, with numbers, in the{" "}
                <Link
                  href="/#selected-work-heading"
                  className="text-[color:var(--accent)] underline underline-offset-2"
                >
                  case studies
                </Link>
                .
              </p>
            </div>
            <ul className="space-y-3 self-center">
              {EXPERTISE.map((line) => (
                <li key={line} className="flex items-start gap-3 text-fg-secondary">
                  <span className="text-[color:var(--accent)] mt-0.5" aria-hidden>
                    ✓
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <CTABlock />
      </main>
      <Footer />

      {/* Entity schema — person + org, same @ids as the sitewide graph. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: personSchema(),
          about: organizationSchema(),
        }}
      />
    </>
  );
}
