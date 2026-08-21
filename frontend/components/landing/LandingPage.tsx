import { SiteHeader } from "@/components/layout/SiteHeader";
import { AudienceSection } from "./AudienceSection";
import { FinalSection } from "./ConversionSections";
import { FaqSection } from "./FaqSection";
import { FeatureStrip } from "./FeatureStrip";
import { FeaturesSection } from "./FeaturesSection";
import { HeroSection } from "./HeroSection";
import { PricingSection } from "./PricingSection";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-[#0d1831]">
      <SiteHeader />
      <HeroSection />
      <FeatureStrip />
      <FeaturesSection />
      <AudienceSection />
      <PricingSection />
      <FaqSection />
      <FinalSection />
    </main>
  );
}
