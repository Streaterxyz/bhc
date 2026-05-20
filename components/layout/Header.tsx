"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BhcLogo } from "@/components/brand/BhcLogo";

// Until the dedicated routes ship, the nav links anchor-scroll to home sections
// and "Contact" jumps the user straight to their mail client.
// When /projects, /services, /about ship, swap these back to internal hrefs.
const NAV_LINKS = [
  { href: "/#selected-work-heading", label: "Projects", external: false },
  { href: "/#services-heading", label: "Services", external: false },
  { href: "/#team-heading", label: "About", external: false },
  {
    href: "mailto:brendon@brendonhill.co",
    label: "Contact",
    external: true,
  },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        scrolled
          ? "backdrop-blur-md bg-black/40 border-b border-[color:var(--border-subtle)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12 h-16 flex items-center justify-between">
        <Link
          href="/"
          aria-label="BHC home"
          className="text-fg-primary hover:text-fg-secondary transition-colors"
        >
          <BhcLogo className="h-5 w-auto" aria-label="Brendon Hill Consultancy home" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-fg-secondary hover:text-fg-primary transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-fg-secondary hover:text-fg-primary transition-colors"
              >
                {link.label}
              </Link>
            ),
          )}
          <a
            href="mailto:brendon@brendonhill.co?subject=Book%20a%2015-minute%20call"
            className="text-sm font-semibold px-4 py-2 rounded-full border border-[color:var(--border-strong)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors"
          >
            Book a call
          </a>
        </nav>

        {/* Mobile: just CTA */}
        <a
          href="mailto:brendon@brendonhill.co?subject=Book%20a%2015-minute%20call"
          className="md:hidden text-xs font-semibold px-3 py-1.5 rounded-full border border-[color:var(--border-strong)]"
        >
          Book a call
        </a>
      </div>
    </header>
  );
}
