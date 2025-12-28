import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useTranslation } from "react-i18next";

import { appColor } from "@/theme/theme.config";

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center justify-center py-20 gap-8 text-center px-4">
      <div className="max-w-3xl flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          {t("hero-title")}{" "}
          <span className={`text-${appColor} text-6xl`}>
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
        {/* Placeholder for Dashboard Image/Preview */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full border-4 border-dashed border-default-200" />
          <p className="italic text-sm">Vista previa de la interfaz</p>
        </div>
      </div>
    </section>
  );
};
