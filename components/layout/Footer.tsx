import Link from "next/link";
import { BhcLogo } from "@/components/brand/BhcLogo";

// Same temporary routing as Header — anchor scrolls until the dedicated
// pages ship, then swap back to internal routes.
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

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
];

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/brendon-hill/",
    label: "LinkedIn",
  },
  {
    href: "https://www.instagram.com/brendonhill_co/",
    label: "Instagram",
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-[color:var(--border-subtle)] px-6 lg:px-12 pt-20 pb-10">
      <div className="max-w-[1440px] mx-auto">
        {/* Top: brand mark + tagline + nav columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">
          {/* Brand block */}
          <div className="md:col-span-5">
            <Link
              href="/"
              aria-label="BHC home"
              className="inline-block text-fg-primary hover:text-fg-secondary transition-colors"
            >
              <BhcLogo
                className="h-6 w-auto"
                aria-label="Brendon Hill Consultancy"
              />
            </Link>
            <p className="mt-8 text-fg-secondary max-w-md leading-relaxed">
              A people-led hospitality consultancy. Strategy, creativity, and
              experience design — for hospitality brands that want to be
              unforgettable.
            </p>
            <p className="mt-6 text-xs tracking-[0.18em] uppercase text-fg-tertiary">
              Elevating Experience. Everywhere.
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-1" />

          {/* Navigate */}
          <div className="md:col-span-2">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-fg-muted mb-5">
              Navigate
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      className="text-fg-secondary hover:text-[color:var(--accent)] transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-fg-secondary hover:text-[color:var(--accent)] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-fg-muted mb-5">
              Contact
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:brendon@brendonhill.co"
                  className="text-fg-secondary hover:text-[color:var(--accent)] transition-colors"
                >
                  brendon@brendonhill.co
                </a>
              </li>
              <li>
                <a
                  href="tel:+61450909038"
                  className="text-fg-secondary hover:text-[color:var(--accent)] transition-colors"
                >
                  +61 450 909 038
                </a>
              </li>
              <li className="text-fg-tertiary">Australia · Worldwide</li>
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-2">
            <p className="text-[0.65rem] tracking-[0.2em] uppercase text-fg-muted mb-5">
              Follow
            </p>
            <ul className="space-y-3 text-sm">
              {SOCIAL_LINKS.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fg-secondary hover:text-[color:var(--accent)] transition-colors"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row: copyright + legal */}
        <div className="pt-8 border-t border-[color:var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-fg-muted">
          <p>© {year} Brendon Hill Consultancy. All rights reserved.</p>
          <ul className="flex items-center gap-6">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="hover:text-fg-secondary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
