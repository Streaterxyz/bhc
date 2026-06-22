import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BhcLogo } from "@/components/brand/BhcLogo";
import {
  AppThemeProvider,
  type AppTheme,
} from "@/components/app/AppThemeProvider";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { readAdminSession } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin sign-in — BHC",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Already signed in → straight to the portal.
  if (await readAdminSession()) redirect("/admin");

  const { error } = await searchParams;
  const store = await cookies();
  const theme: AppTheme =
    store.get("app-theme")?.value === "light" ? "light" : "dark";

  return (
    <AppThemeProvider initial={theme}>
      <main className="min-h-screen flex flex-col items-center justify-center bg-bg-base px-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-10 text-center">
            <BhcLogo
              className="h-6 w-auto text-fg-primary mb-6"
              aria-label="Brendon Hill Consultancy"
            />
            <p className="eyebrow mb-3">Admin Portal</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-fg-primary">
              Sign in
            </h1>
            <p className="text-sm text-fg-tertiary mt-2">
              Enter your admin email — we&apos;ll send a secure sign-in link.
            </p>
          </div>
          <AdminLoginForm hadError={error === "invalid"} />
        </div>
      </main>
    </AppThemeProvider>
  );
}
