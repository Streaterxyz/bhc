import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { BookCallProvider } from "@/components/calendly/BookCallProvider";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteGraph } from "@/lib/schema";

// Env-gated GA4: only loads when NEXT_PUBLIC_GA_ID is set, so local dev /
// preview builds stay analytics-free unless explicitly configured.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BHC — Hospitality Consultancy Sydney | Brendon Hill Consultancy",
  description:
    "Everything Elevated. No Exceptions. BHC is a people-led hospitality consultancy in Sydney helping venues lift profit through strategy, operations, beverage programs and team development — systems used across 100+ venues.",
  metadataBase: new URL("https://brendonhill.co"),
  // Live on brendonhill.co — marketing site is indexable. Funnel pages
  // (/training, checkout, downloads) keep their own per-page noindex.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  // OG and Twitter card images come from app/opengraph-image.tsx and
  // app/twitter-image.tsx (Next.js auto-merges them into metadata).
  openGraph: {
    title: "BHC — Brendon Hill Consultancy",
    description: "Everything Elevated. No Exceptions.",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "BHC — Brendon Hill Consultancy",
    description: "Everything Elevated. No Exceptions.",
  },
  // Favicon is auto-detected from app/icon.svg by Next.js.
  // Meta (Facebook) Business Manager domain verification — must render in
  // <head> as static HTML for their crawler.
  other: {
    "facebook-domain-verification": "oz1gei7a9uydbylvrycw5ffhchbn54",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-base text-fg-primary">
        <PostHogProvider>
          <BookCallProvider>{children}</BookCallProvider>
        </PostHogProvider>
        <JsonLd data={siteGraph()} />
      </body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
      <MetaPixel />
    </html>
  );
}
