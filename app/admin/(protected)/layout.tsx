import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import { BhcLogo } from "@/components/brand/BhcLogo";
import {
  AppThemeProvider,
  type AppTheme,
} from "@/components/app/AppThemeProvider";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { requireAdmin } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin — BHC",
  robots: { index: false, follow: false },
};

// Reads the admin cookie → dynamic per request.
export const dynamic = "force-dynamic";

/**
 * Gate for the whole admin portal. requireAdmin() redirects to /admin/login
 * when there's no valid admin session (or the email has been removed from
 * the allowlist). Reuses the /app light/dark theme system.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  const store = await cookies();
  const theme: AppTheme =
    store.get("app-theme")?.value === "light" ? "light" : "dark";

  return (
    <AppThemeProvider initial={theme}>
      <div className="min-h-screen bg-bg-base">
        <header className="sticky top-0 z-20 border-b border-[color:var(--border-subtle)] bg-bg-base/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-6 lg:px-10">
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                aria-label="Admin home"
                className="text-fg-primary"
              >
                <BhcLogo
                  className="h-5 w-auto"
                  aria-label="Brendon Hill Consultancy"
                />
              </Link>
              <span className="rounded-full border border-[color:var(--border-default)] px-2.5 py-1 text-[0.6rem] tracking-[0.18em] uppercase text-fg-tertiary">
                Admin
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-fg-muted sm:inline">
                {admin.email}
              </span>
              <ThemeToggle />
              <form action="/api/admin/logout" method="post">
                <button
                  type="submit"
                  className="text-xs tracking-[0.12em] uppercase text-fg-tertiary hover:text-fg-primary transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
          <AdminNav />
        </header>

        <main className="px-6 lg:px-10 py-8 lg:py-10">{children}</main>
      </div>
    </AppThemeProvider>
  );
}
