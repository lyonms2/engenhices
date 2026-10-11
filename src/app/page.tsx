import { EncomendasCta } from "@/components/home/EncomendasCta";
import { FeaturedCriacoes } from "@/components/home/FeaturedCriacoes";
import { Hero } from "@/components/home/Hero";
import { LabSection } from "@/components/home/LabSection";
import { ProcessSection } from "@/components/home/ProcessSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCriacoes />
      <LabSection />
      <ProcessSection />
      <EncomendasCta />
    </>
  );
}
