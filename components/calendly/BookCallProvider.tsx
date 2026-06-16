"use client";

/**
 * Global "Book a call" modal provider.
 *
 * Mounts a single Calendly inline-embed modal at the root of the layout
 * tree. Every BookCallButton (or any consumer of useBookCall()) opens the
 * SAME modal — there's only ever one mounted, which keeps the Calendly
 * iframe load count to one even if the user toggles it multiple times.
 *
 * The iframe is lazy-mounted (only renders while `isOpen`) so we don't
 * eagerly load Calendly on every page view.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { BookCallModal } from "./BookCallModal";
import { capture, EVENTS } from "@/lib/analytics";

type BookCallCtx = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const Ctx = createContext<BookCallCtx | null>(null);

export function BookCallProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);

  const open = useCallback(() => {
    capture(EVENTS.BOOK_CALL_OPEN);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  // Lock the body scroll while the modal is up so the page behind doesn't
  // scroll when the user swipes inside the Calendly widget on mobile.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Escape closes — registered globally while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <Ctx.Provider value={{ isOpen, open, close }}>
      {children}
      <BookCallModal isOpen={isOpen} onClose={close} />
    </Ctx.Provider>
  );
}

export function useBookCall(): BookCallCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useBookCall must be used inside <BookCallProvider>");
  }
  return ctx;
}
