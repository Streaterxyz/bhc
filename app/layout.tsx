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
  metadataBase: new URL("https://www.brendonhill.co"),
  // Soft-launch: keep staging out of search results until V2 goes live.
  // Flip to { index: true, follow: true } when ready to launch publicly.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
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
