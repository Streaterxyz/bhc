import type { Metadata } from "next";
import Link from "next/link";

import { BhcLogo } from "@/components/brand/BhcLogo";
import { DownloadButton } from "@/components/funnel/DownloadButton";
import { readLeadSession } from "@/lib/auth/cookie";
import { getLeadById } from "@/lib/leads";
import { hasActivePurchase } from "@/lib/purchases";
import { KIT_FILES } from "@/lib/downloads";
import { isR2Configured } from "@/lib/r2";

export const metadata: Metadata = {
  title: "Your Downloads — BHC",
  description: "Download your Profit Patch Kit.",
  robots: { index: false, follow: false },
};

// Reads cookies + DB → render dynamically per request.
export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const session = await readLeadSession();
  const lead = session ? await getLeadById(session.leadId) : null;
  const purchased = lead ? await hasActivePurchase(lead.id) : false;
  const r2Ready = isR2Configured();

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <header className="px-6 lg:px-12 h-16 flex items-center">
        <Link href="/" aria-label="BHC home" className="text-fg-primary">
          <BhcLogo
            className="h-5 w-auto"
            aria-label="Brendon Hill Consultancy home"
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-20">
        {!lead ? (
          <GateMessage
            eyebrow="Downloads"
            title="Access your training first."
            body="Enter your email on the training page to unlock your account, then return here."
            ctaHref="/training"
            ctaLabel="Go to the training"
          />
        ) : !purchased ? (
          <GateMessage
            eyebrow="Downloads"
            title="You haven't unlocked the kit yet."
            body="The Profit Patch Kit gives you every tool from the training, ready to drop into your venue. Grab it and your downloads appear here instantly."
            ctaHref="/training"
            ctaLabel="Get the Profit Patch Kit"
          />
        ) : (
          <div className="w-full max-w-3xl mx-auto">
            <p className="eyebrow mb-4">Your Downloads</p>
            <h1 className="text-3xl lg:text-5xl font-extrabold tracking-tight mb-3">
              {lead.name ? `Here you go, ${lead.name}.` : "Here you go."}
            </h1>
            <p className="body-lg max-w-xl mb-10">
              Your Profit Patch Kit is ready. Download links are unique to you
              and refresh each time — grab everything below.
            </p>

            {!r2Ready && (
              <div className="mb-8 rounded-xl border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/[0.04] p-5">
                <p className="text-sm text-fg-secondary">
                  Your files are being prepared and will be available here
                  shortly. We&apos;ve emailed you and will let you know the
                  moment they&apos;re live.
                </p>
              </div>
            )}

            <ul className="divide-y divide-[color:var(--border-subtle)] border-y border-[color:var(--border-subtle)]">
              {KIT_FILES.map((file) => (
                <li
                  key={file.key}
                  className="py-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
                >
                  <div className="flex-1">
                    <p className="text-base lg:text-lg font-semibold text-fg-primary mb-1">
                      {file.name}
                    </p>
                    <p className="text-sm text-fg-tertiary leading-snug max-w-xl">
                      {file.description}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {r2Ready ? (
                      <DownloadButton fileKey={file.key} label="Download" />
                    ) : (
                      <span className="inline-flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-fg-muted">
                        Preparing…
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-sm text-fg-muted">
              Questions or trouble downloading? Email{" "}
              <a
                href="mailto:brendon@brendonhill.co"
                className="text-[color:var(--accent)] hover:underline"
              >
                brendon@brendonhill.co
              </a>
              .
            </p>
          </div>
        )}
      </main>

      <footer className="px-6 lg:px-12 py-8 text-center">
        <p className="text-xs text-fg-muted">
          © {new Date().getFullYear()} Brendon Hill Consultancy. Everything
          Elevated. No Exceptions.
        </p>
      </footer>
    </div>
  );
}

function GateMessage({
  eyebrow,
  title,
  body,
  ctaHref,
  ctaLabel,
}: {
  eyebrow: string;
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
        {title}
      </h1>
      <p className="text-fg-secondary mb-8">{body}</p>
      <Link
        href={ctaHref}
        className="inline-flex items-center justify-center gap-3 bg-white text-black font-semibold text-base px-8 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors"
      >
        <span>{ctaLabel}</span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
