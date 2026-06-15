"use client";

/**
 * Triggers the global Calendly booking modal.
 *
 * Two flavours:
 *   <BookCallButton>          — sensible default styling (pill button)
 *   <BookCallButton variant="text"> — text link style
 *   <BookCallButton variant="custom" className="…"> — fully custom
 *
 * Always rendered as a real <button> so it remains keyboard-accessible
 * and is the right semantic element for an in-page action.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { useBookCall } from "./BookCallProvider";

type Variant = "default" | "primary" | "compact" | "text" | "custom";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  variant?: Variant;
  children?: ReactNode;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  default:
    "text-sm font-semibold px-4 py-2 rounded-full border border-[color:var(--border-strong)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors",
  primary:
    "group inline-flex items-center justify-between gap-6 bg-white text-black font-semibold text-base px-7 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors",
  compact:
    "text-xs font-semibold px-3 py-1.5 rounded-full border border-[color:var(--border-strong)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors",
  text: "text-sm tracking-[0.16em] uppercase text-fg-secondary hover:text-[color:var(--accent)] transition-colors border-b border-[color:var(--border-default)] hover:border-[color:var(--accent)] pb-1",
  // Caller supplies all styling. Useful when the surrounding design
  // already has a unique button treatment we shouldn't overwrite.
  custom: "",
};

export const BookCallButton = forwardRef<HTMLButtonElement, Props>(
  function BookCallButton(
    { variant = "default", className, children, ...rest },
    ref,
  ) {
    const { open } = useBookCall();
    const base = VARIANT_CLASSES[variant];
    return (
      <button
        ref={ref}
        type="button"
        onClick={open}
        className={[base, className].filter(Boolean).join(" ")}
        {...rest}
      >
        {children ?? "Book a call"}
      </button>
    );
  },
);
