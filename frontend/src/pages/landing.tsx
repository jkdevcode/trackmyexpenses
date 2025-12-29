import LandingLayout from "@/layouts/landing";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { HowItWorks } from "@/features/landing/components/HowItWorks";
import { FeatureShowcase } from "@/features/landing/components/FeatureShowcase";

export default function LandingPage() {
  return (
    <LandingLayout>
      <HeroSection />
      <HowItWorks />
      <FeatureShowcase />
    </LandingLayout>
  );
}
