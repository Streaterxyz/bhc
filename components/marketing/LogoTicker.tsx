"use client";

import Image from "next/image";

import { CLIENTS } from "@/lib/clients";

/**
 * Auto-scrolling logo marquee for the training landing page.
 *
 * Seamless loop: the logo set is rendered twice and the track is translated
 * by exactly one set's width (-50% of a 2× track). Each item carries a fixed
 * right margin (not a flex `gap`) so the trailing space is consistent and
 * the -50% wrap lands pixel-perfect.
 *
 * Motion + accessibility:
 *   - CSS transform animation (see globals.css .logo-ticker-track) — no JS
 *     scroll loop, so no main-thread jank.
 *   - Pauses on hover so a logo that catches the eye can be read.
 *   - prefers-reduced-motion freezes it to a static row.
 *   - The duplicated second set is aria-hidden so SRs read each logo once.
 */
export function LogoTicker() {
  const sets = [0, 1]; // original + aria-hidden duplicate

  return (
    <div className="logo-ticker relative w-full overflow-hidden py-2">
      <ul className="logo-ticker-track flex w-max items-center">
        {sets.map((setIndex) =>
          CLIENTS.map((client) => (
            <li
              key={`${setIndex}-${client.name}`}
              className="shrink-0 mr-12 lg:mr-16"
              aria-hidden={setIndex === 1}
            >
              <Image
                src={client.src}
                alt={setIndex === 0 ? `${client.name} — BHC client` : ""}
                width={150}
                height={48}
                className="h-7 lg:h-8 w-auto object-contain opacity-50 transition-opacity duration-300 hover:opacity-100"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
