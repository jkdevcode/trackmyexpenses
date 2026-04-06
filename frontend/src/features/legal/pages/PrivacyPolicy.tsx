import { useTranslation } from "react-i18next";

import LandingLayout from "@/layouts/landing";
import { APP_CONFIG } from "@/config/app";

export function PrivacyPolicy() {
  const { t } = useTranslation("legal");

  const sections = [
    "data",
    "usage",
    "storage",
    "third_parties",
    "security",
    "rights",
    "contact",
  ] as const;

  return (
    <LandingLayout>
      <div className="max-w-3xl mx-auto py-16 px-6 pb-24">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("privacy.title")}</h1>
          <p className="text-default-500">{t("privacy.updated")}</p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section} className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {t(`privacy.sections.${section}.title`)}
              </h2>
              <p className="text-default-700 leading-relaxed">
                {t(`privacy.sections.${section}.content`, {
                  email: APP_CONFIG.contactEmail,
                })}
              </p>
            </section>
          ))}
        </div>
      </div>
    </LandingLayout>
  );
}
