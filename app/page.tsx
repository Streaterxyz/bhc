import { Header } from "@/components/layout/Header";
import { GlobeHero } from "@/components/globe/GlobeHero";
import { WhyBHC } from "@/components/marketing/WhyBHC";
import { SelectedWork } from "@/components/marketing/SelectedWork";
import { Testimonials } from "@/components/marketing/Testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <GlobeHero />
        <WhyBHC />
        <SelectedWork />
        <Testimonials />
      </main>
    </>
  );
}
