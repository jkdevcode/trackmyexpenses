import { useTranslation } from "react-i18next";

import { title } from "@/components/ui/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-6 py-16 md:py-24">
        <div className="text-center">
          <h1 className={title()}>
            {t("dashboard")} - {t("welcome-to")}&nbsp;
            <span className={title({ color: "violet" })}>{"User"}</span>
          </h1>
        </div>
      </section>
    </DefaultLayout>
  );
}
