"use client";

import { useEffect, useRef, useState } from "react";

import { formatMoney } from "@/lib/tools/roster";

/** Counts up from 0 to `value` on mount (easeOutCubic). Respects reduced motion. */
export function AnimatedDollar({
  value,
  durationMs = 900,
}: {
  value: number;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || value === 0) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, durationMs]);

  return <span className="tabular-nums">{formatMoney(display)}</span>;
}
