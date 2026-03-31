import LandingLayout from "@/layouts/landing";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { HowItWorks } from "@/features/landing/components/HowItWorks";
import { FeatureShowcase } from "@/features/landing/components/FeatureShowcase";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function LandingPage() {
  const { t: tMeta } = useTranslation("meta");
  usePageMeta({
    title: tMeta("landing.title"),
    description: tMeta("landing.description")
  });
  return (
    <LandingLayout>
      <HeroSection />
      <HowItWorks />
      <FeatureShowcase />
    </LandingLayout>
  );
}
