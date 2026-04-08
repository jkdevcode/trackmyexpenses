import { useTranslation } from "react-i18next";

import { getLandingImages } from "../utils";

import { useAppColorVariants } from "@/theme/app-color-variants";

export const FeatureShowcase = () => {
  const { t, i18n } = useTranslation("landing");
  const appColorVariants = useAppColorVariants();
  const images = getLandingImages(i18n.language);

  return (
    <section className="py-20 px-4" id="features">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("features-title")}{" "}
            <span className={appColorVariants.text}>
              {t("features-title-highlight")}
            </span>
          </h2>
          <p className="text-lg text-default-500">{t("features-desc")}</p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${appColorVariants.softBgText}`}
              >
                ✓
              </div>
              <span>{t("feature-1")}</span>
            </li>
            <li className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${appColorVariants.softBgText}`}
              >
                ✓
              </div>
              <span>{t("feature-2")}</span>
            </li>
            <li className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${appColorVariants.softBgText}`}
              >
                ✓
              </div>
              <span>{t("feature-3")}</span>
            </li>
          </ul>
        </div>
        <div className="bg-default-100 rounded-3xl aspect-square flex items-center justify-center text-default-300 border border-default-200 shadow-inner overflow-hidden">
          <img
            alt={t("history-title")}
            className="w-full h-full object-cover object-top-left"
            src={images.dashboard}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};
