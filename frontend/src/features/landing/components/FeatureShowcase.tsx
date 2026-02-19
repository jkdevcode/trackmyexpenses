import { useTranslation } from "react-i18next";

import { appColor } from "@/theme/theme.config";

export const FeatureShowcase = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4" id="features">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("landing:features-title")}{" "}
            <span className={`text-${appColor}`}>
              {t("landing:features-title-highlight")}
            </span>
          </h2>
          <p className="text-lg text-default-500">
            {t("landing:features-desc")}
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full bg-${appColor}/10 flex items-center justify-center text-${appColor} text-xs`}
              >
                ✓
              </div>
              <span>{t("landing:feature-1")}</span>
            </li>
            <li className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full bg-${appColor}/10 flex items-center justify-center text-${appColor} text-xs`}
              >
                ✓
              </div>
              <span>{t("landing:feature-2")}</span>
            </li>
            <li className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full bg-${appColor}/10 flex items-center justify-center text-${appColor} text-xs`}
              >
                ✓
              </div>
              <span>{t("landing:feature-3")}</span>
            </li>
          </ul>
        </div>
        <div className="bg-default-100 rounded-3xl aspect-square flex items-center justify-center text-default-300 border border-default-200 shadow-inner">
          <p className="italic">Visualización del Historial</p>
        </div>
      </div>
    </section>
  );
};
