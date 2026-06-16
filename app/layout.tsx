import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { BookCallProvider } from "@/components/calendly/BookCallProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BHC — Brendon Hill Consultancy",
  description:
    "Everything Elevated. No Exceptions. A people-led hospitality consultancy combining strategy, creativity, and experience design.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-base text-fg-primary">
        <BookCallProvider>{children}</BookCallProvider>
      </body>
    </html>
  );
}
