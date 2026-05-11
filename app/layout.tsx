import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

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
  openGraph: {
    title: "BHC — Brendon Hill Consultancy",
    description: "Everything Elevated. No Exceptions.",
    type: "website",
    locale: "en_AU",
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
        {children}
      </body>
    </html>
  );
}
