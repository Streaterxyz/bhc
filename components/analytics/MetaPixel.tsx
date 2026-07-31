"use client";

/**
 * Meta Pixel — env-gated on NEXT_PUBLIC_META_PIXEL_ID (build-time; changing
 * it needs a redeploy, like the other NEXT_PUBLIC_ analytics keys).
 *
 * Loads the fbq snippet once and tracks PageView on App Router navigations.
 * Conversion events (Lead, InitiateCheckout) are fired from the funnel
 * components via metaTrack() in lib/analytics.ts with an event id shared
 * with the server-side CAPI mirror (lib/meta.ts) so Meta dedups the pair.
 */

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MetaPixel() {
  const pathname = usePathname();
  // The base snippet fires the first PageView itself; only client-side
  // navigations after mount need a manual track.
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!PIXEL_ID) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    (window as { fbq?: (...args: unknown[]) => void }).fbq?.(
      "track",
      "PageView",
    );
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`,
      }}
    />
  );
}
