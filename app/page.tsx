import { Header } from "@/components/layout/Header";
import { GlobeHero } from "@/components/globe/GlobeHero";
import { WhyBHC } from "@/components/marketing/WhyBHC";
import { Services } from "@/components/marketing/Services";
import { SelectedWork } from "@/components/marketing/SelectedWork";
import { Testimonials } from "@/components/marketing/Testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <GlobeHero />
        <WhyBHC />
        <Services />
        <SelectedWork />
        <Testimonials />
      </main>
    </>
  );
}
