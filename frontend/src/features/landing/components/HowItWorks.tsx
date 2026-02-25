import { useTranslation } from "react-i18next";

export const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      title: t("landing:step-1-title"),
      description: t("landing:step-1-desc"),
      icon: "📸",
    },
    {
      title: t("landing:step-2-title"),
      description: t("landing:step-2-desc"),
      icon: "🔍",
    },
    {
      title: t("landing:step-3-title"),
      description: t("landing:step-3-desc"),
      icon: "✅",
    },
  ];

  return (
    <section className="py-20 bg-default-50 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("landing:how-it-works-title")}
          </h2>
          <p className="text-default-500 max-w-xl mx-auto">
            {t("landing:how-it-works-subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col items-center text-center p-8 bg-background rounded-2xl border border-default-100 shadow-sm transition-transform hover:-translate-y-1"
            >
              <span className="text-5xl mb-6">{step.icon}</span>
              <h3 className="text-xl font-bold mb-3">
                {index + 1}. {step.title}
              </h3>
              <p className="text-default-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
