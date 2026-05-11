"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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
          className="font-extrabold text-xl tracking-tight"
        >
          BHC
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-fg-secondary hover:text-fg-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="text-sm font-semibold px-4 py-2 rounded-full border border-[color:var(--border-strong)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors"
          >
            Book a call
          </Link>
        </nav>

        {/* Mobile: just CTA */}
        <Link
          href="/contact"
          className="md:hidden text-xs font-semibold px-3 py-1.5 rounded-full border border-[color:var(--border-strong)]"
        >
          Book a call
        </Link>
      </div>
    </header>
  );
}
