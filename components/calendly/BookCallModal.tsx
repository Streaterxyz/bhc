"use client";

/**
 * Calendly inline-embed modal.
 *
 * Layout:
 *   - Mobile (<sm): true fullscreen, no border-radius
 *   - Desktop (≥sm): centered modal, max-w-[1040px], 92vh, rounded
 *
 * Uses the Calendly inline embed (vs their JS widget) because we want
 * (a) zero external JS to load, (b) control over the surrounding chrome,
 * (c) clean unmount when closed. The iframe receives BHC-branded
 * background/text/primary colors via Calendly's documented embed params.
 *
 * Iframe is conditionally rendered — it only mounts while `isOpen`, so
 * we don't preload Calendly on every page view. Re-opening creates a
 * fresh iframe, which is a small cost (~700ms) for the much bigger UX
 * win of never paying that cost until the user actually wants it.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const CALENDLY_URL = "https://calendly.com/brendon-brendonhill/30min";

/** Build the inline-embed URL with BHC-brand styling parameters. */
function buildEmbedUrl(host: string): string {
  const params = new URLSearchParams({
    embed_domain: host,
    embed_type: "Inline",
    background_color: "0a0a0a", // matches --bg-base
    text_color: "ffffff",
    primary_color: "f4c21c", // BHC gold
    hide_gdpr_banner: "1",
  });
  return `${CALENDLY_URL}?${params.toString()}`;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function BookCallModal({ isOpen, onClose }: Props) {
  // Resolve the embed_domain client-side so the param is correct on every
  // environment (localhost, bhc-seven.vercel.app, brendonhill.co, etc.)
  // without us having to hard-code it.
  const [host, setHost] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setHost(window.location.host);
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="book-call-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Book a call with Brendon"
          className="fixed inset-0 z-[100] flex sm:items-center sm:justify-center sm:p-4 lg:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Backdrop — click to close */}
          <button
            type="button"
            aria-label="Close booking modal"
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
          />

          {/* Modal shell */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex flex-col w-full h-full sm:w-auto sm:h-auto sm:max-w-[1040px] sm:max-h-[92vh] sm:min-h-[760px] sm:w-[92vw] bg-bg-base sm:rounded-2xl sm:border sm:border-[color:var(--border-strong)] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 border-b border-[color:var(--border-subtle)]">
              <div className="min-w-0">
                <div className="text-[0.6rem] sm:text-[0.65rem] tracking-[0.2em] uppercase text-[color:var(--accent)] font-semibold mb-0.5">
                  Book a call
                </div>
                <div className="text-base sm:text-lg font-extrabold tracking-tight text-fg-primary truncate">
                  30 minutes with Brendon
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border border-[color:var(--border-default)] text-fg-tertiary hover:text-fg-primary hover:border-[color:var(--border-strong)] bg-black/40 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M1 1L13 13M13 1L1 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </div>

            {/* Calendly iframe area. min-h needed because Calendly's
                widget content collapses below ~700px and looks broken. */}
            <div className="relative flex-1 min-h-[640px] sm:min-h-[700px] bg-bg-base">
              {host ? (
                <iframe
                  key={host}
                  src={buildEmbedUrl(host)}
                  title="Book a call with Brendon — Calendly scheduler"
                  className="absolute inset-0 w-full h-full"
                  style={{
                    border: 0,
                    colorScheme: "dark",
                  }}
                  loading="eager"
                />
              ) : (
                /* Pre-hydration: just a dark void. The iframe mounts the
                   moment `host` resolves on the next tick (effectively
                   instant once React hydrates). */
                <div aria-hidden className="absolute inset-0 bg-bg-base" />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
