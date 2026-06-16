"use client";

/**
 * Env-gated PostHog provider. Only initialises when NEXT_PUBLIC_POSTHOG_KEY
 * is set, so local dev / preview stay analytics-free unless configured.
 *
 * App Router specifics:
 *   - capture_pageview: false — we capture $pageview manually on route
 *     change (the SPA navigations Next does don't fire a full page load),
 *     avoiding both missed and double-counted pageviews.
 *   - person_profiles: "identified_only" — anonymous visitors don't create
 *     person profiles until they opt in (identifyLead on lead capture),
 *     which keeps MAU/cost down.
 */

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function PostHogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!KEY) return;
    if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;
    posthog.init(KEY, {
      api_host: HOST,
      capture_pageview: false,
      capture_pageleave: true,
      person_profiles: "identified_only",
    });
  }, []);

  // When unconfigured, render children untouched (no provider overhead).
  if (!KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}

/** Captures a $pageview on every App Router navigation. */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!(posthog as unknown as { __loaded?: boolean }).__loaded) return;
    let url = window.origin + pathname;
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}
