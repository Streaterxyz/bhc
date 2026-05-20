import { ImageResponse } from "next/og";

/**
 * Open Graph image for the home page / default site link unfurl.
 * Next.js renders this to a 1200x630 PNG at build time. Lives at /opengraph-image.
 *
 * Lightweight JSX-only render — no font fetches (keeps build time low and
 * avoids network flakes during Vercel builds).
 */

export const alt = "BHC — Brendon Hill Consultancy. Everything Elevated. No Exceptions.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 80% 60%, rgba(244,194,28,0.18), transparent 55%)",
        }}
      >
        {/* Top row — BHC mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            color: "#ffffff",
            fontSize: "44px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          BHC
          <span
            style={{
              fontSize: "16px",
              fontWeight: 400,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#999999",
              marginLeft: "20px",
            }}
          >
            Brendon Hill Consultancy
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "112px",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
          }}
        >
          <span>Everything Elevated.</span>
          <span style={{ color: "#f4c21c" }}>No Exceptions.</span>
        </div>

        {/* Bottom row — tagline */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#999999",
            fontSize: "20px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>Hospitality Consulting · Embedded · Accountable</span>
          <span style={{ color: "#f4c21c" }}>brendonhill.co</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
