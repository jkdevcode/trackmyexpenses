import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useTranslation } from "react-i18next";

import { getLandingImages } from "../utils";

import { useAppColorVariants } from "@/theme/app-color-variants";
import { useColorTheme } from "@/hooks/use-color-theme";

export const HeroSection = () => {
  const { t, i18n } = useTranslation("landing");
  const { appColor } = useColorTheme();
  const appColorVariants = useAppColorVariants();
  const images = getLandingImages(i18n.language);

  return (
    <section className="flex flex-col items-center justify-center py-20 gap-8 text-center px-4">
      <div className="max-w-3xl flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {t("hero-title")}{" "}
          <span className={`text-4xl md:text-6xl ${appColorVariants.text}`}>
            {t("hero-title-highlight")}
          </span>
        </h1>
        <p className="text-xl text-default-500 max-w-2xl mx-auto">
          {t("hero-subtitle")}
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          as={Link}
          className="px-8 font-semibold"
          color={appColor}
          href="/register"
          size="lg"
        >
          {t("hero-cta-primary")}
        </Button>
        <Button
          as={Link}
          className="px-8"
          href="#how-it-works"
          size="lg"
          variant="bordered"
        >
          {t("hero-cta-secondary")}
        </Button>
      </div>
      <div className="mt-12 w-full max-w-5xl rounded-2xl overflow-hidden border border-default-200 bg-default-50 shadow-2xl aspect-video flex items-center justify-center text-default-300">
        <img
          alt={t("hero-preview")}
          className="w-full h-full object-cover object-top"
          src={images.principal}
          loading="lazy"
        />
      </div>
    </section>
  );
};
