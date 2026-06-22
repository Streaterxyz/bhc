"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/customers", label: "Customers", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 px-6 lg:px-10 -mt-px">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative px-3 py-3 text-sm transition-colors ${
              active
                ? "text-fg-primary font-semibold"
                : "text-fg-tertiary hover:text-fg-secondary"
            }`}
          >
            {item.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 bg-[color:var(--accent)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
