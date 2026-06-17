import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BhcLogo } from "@/components/brand/BhcLogo";
import { AccessForm } from "@/components/funnel/AccessForm";

export const metadata: Metadata = {
  title: "Access Your Account — BHC",
  description: "Get a secure link to access your account.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AccessPage() {
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
        <div className="w-full max-w-md mx-auto text-center">
          <p className="eyebrow mb-4">Account Access</p>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-3">
            Get your access link.
          </h1>
          <p className="text-fg-secondary mb-8">
            Enter your email and we&apos;ll send a secure one-time link to get
            you back into your account.
          </p>
          <div className="flex justify-center">
            <Suspense
              fallback={
                <div className="w-full max-w-md h-14 rounded-xl bg-bg-elevated animate-pulse" />
              }
            >
              <AccessForm />
            </Suspense>
          </div>
        </div>
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
