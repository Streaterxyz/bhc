import { Header } from "@/components/layout/Header";
import { GlobeHero } from "@/components/globe/GlobeHero";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <GlobeHero />

        {/* Placeholder section so the page has scroll context. */}
        <section
          id="after-hero"
          className="bg-bg-base py-32 px-6 lg:px-12 border-t border-[color:var(--border-subtle)] scroll-mt-16"
        >
          <div className="max-w-[1440px] mx-auto">
            <p className="eyebrow mb-6">What&apos;s next</p>
            <h2 className="headline max-w-3xl">
              Services, why BHC, selected work, and testimonials — coming
              online below the globe.
            </h2>
          </div>
        </section>
      </main>
    </>
  );
}
