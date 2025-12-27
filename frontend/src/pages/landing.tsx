import LandingLayout from "@/layouts/landing";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";

export default function LandingPage() {
  return (
    <LandingLayout>
      <HeroSection />
      <HowItWorks />
      <FeatureShowcase />
    </LandingLayout>
  );
}
