import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GlobeHero } from "@/components/globe/GlobeHero";
import { ClientLogos } from "@/components/marketing/ClientLogos";
import { WhyThisExists } from "@/components/marketing/WhyThisExists";
import { Services } from "@/components/marketing/Services";
import { HowWeWork } from "@/components/marketing/HowWeWork";
import { SelectedWork } from "@/components/marketing/SelectedWork";
import { WhyBHC } from "@/components/marketing/WhyBHC";
import { Testimonials } from "@/components/marketing/Testimonials";
import { TheTeam } from "@/components/marketing/TheTeam";
import { CTABlock } from "@/components/marketing/CTABlock";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <GlobeHero />
        <ClientLogos />
        <WhyThisExists />
        <Services />
        <HowWeWork />
        <SelectedWork />
        <WhyBHC />
        <Testimonials />
        <TheTeam />
        <CTABlock />
      </main>
      <Footer />
    </>
  );
}
