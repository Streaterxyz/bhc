import { Header } from "@/components/layout/Header";
import { GlobeHero } from "@/components/globe/GlobeHero";
import { SelectedWork } from "@/components/marketing/SelectedWork";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <GlobeHero />
        <SelectedWork />
      </main>
    </>
  );
}
