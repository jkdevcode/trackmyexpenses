import { useTranslation } from "react-i18next";

import LandingLayout from "@/layouts/landing";

export function TermsOfService() {
  const { t } = useTranslation("legal");

  const sections = [
    "intro",
    "use",
    "responsibilities",
    "acceptable",
    "data",
    "liability",
    "modifications",
    "termination",
  ] as const;

  return (
    <LandingLayout>
      <div className="max-w-3xl mx-auto py-16 px-6 pb-24">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("terms.title")}</h1>
          <p className="text-default-500">{t("terms.updated")}</p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section} className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {t(`terms.sections.${section}.title`)}
              </h2>
              <p className="text-default-700 leading-relaxed">
                {t(`terms.sections.${section}.content`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </LandingLayout>
  );
}
