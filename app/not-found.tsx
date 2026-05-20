import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="relative min-h-screen flex items-center justify-center px-6 lg:px-12 py-32 overflow-hidden">
        {/* Subtle gold radial glow as visual interest */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 30%, rgba(244,194,28,0.08), transparent 55%)",
          }}
        />

        <div className="relative max-w-3xl text-center">
          <p className="eyebrow mb-8 text-[color:var(--accent)]">
            Error 404 · Page not found
          </p>

          <h1 className="display mb-8">
            Off the
            <br />
            <span className="text-[color:var(--accent)]">map.</span>
          </h1>

          <p className="body-lg max-w-xl mx-auto mb-12 text-fg-secondary">
            The page you&apos;re looking for doesn&apos;t exist or has moved.
            Let&apos;s get you back to where the work is.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="group inline-flex items-center justify-between gap-6 bg-white text-black font-semibold text-base px-7 py-4 rounded-full hover:bg-[color:var(--accent)] transition-colors"
            >
              <span>Back to the globe</span>
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            <a
              href="mailto:brendon@brendonhill.co"
              className="text-sm tracking-[0.16em] uppercase text-fg-secondary hover:text-[color:var(--accent)] transition-colors border-b border-[color:var(--border-default)] hover:border-[color:var(--accent)] pb-1"
            >
              Or email Brendon directly
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
