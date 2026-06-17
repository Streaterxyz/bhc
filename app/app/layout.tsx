import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BhcLogo } from "@/components/brand/BhcLogo";
import { AppThemeProvider, type AppTheme } from "@/components/app/AppThemeProvider";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { readLeadSession } from "@/lib/auth/cookie";
import { hasActivePurchase } from "@/lib/purchases";

export const metadata: Metadata = {
  title: "Profit Patch Kit — BHC",
  description: "Your interactive Profit Patch Kit tools.",
  robots: { index: false, follow: false },
};

// Reads cookies + entitlement → dynamic per request.
export const dynamic = "force-dynamic";

/**
 * Gate for the entire /app tools workspace. Post-purchase only:
 *   - no magic-link session → back to the training gate
 *   - session but no active paid purchase → back to training (upsell)
 * The theme is read from the `app-theme` cookie for a flash-free first paint.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await readLeadSession();
  if (!session) redirect("/training");
  if (!(await hasActivePurchase(session.leadId))) redirect("/training");

  const store = await cookies();
  const theme: AppTheme =
    store.get("app-theme")?.value === "light" ? "light" : "dark";

  return (
    <AppThemeProvider initial={theme}>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[color:var(--border-subtle)] bg-bg-base/80 px-6 backdrop-blur-md lg:px-10">
        <Link href="/app" aria-label="Profit Patch Kit home" className="text-fg-primary">
          <BhcLogo className="h-5 w-auto" aria-label="Brendon Hill Consultancy" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-[0.7rem] tracking-[0.18em] uppercase text-fg-muted sm:inline">
            Profit Patch Kit
          </span>
          <ThemeToggle />
        </div>
      </header>
      {children}
    </AppThemeProvider>
  );
}
