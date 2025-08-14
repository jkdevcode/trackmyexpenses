import { Trans, useTranslation } from "react-i18next";
import { title, subtitle } from "@/components/primitives";
import { button as buttonStyles } from "@heroui/theme";
import DefaultLayout from "@/layouts/default";
import { Link } from "@heroui/link";

export default function IndexPage() {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-6 py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        
        {/* Título y subtítulo */}
        <div className="inline-block max-w-2xl text-center">
          <h1 className={title()}>
            {t("welcome-to")}&nbsp;
            <span className={title({ color: "violet" })}>{t("my-app")}</span>
          </h1>
          <p className={subtitle({ class: "mt-4 text-gray-600" })}>
            <Trans i18nKey="start-your-journey-with-us" />
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 mt-6">
          <Link
            href="/login"
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
              class: "px-6 py-3 text-lg"
            })}
          >
            {t("login")}
          </Link>

          <Link
            href="/register"
            className={buttonStyles({
              variant: "bordered",
              radius: "full",
              class: "px-6 py-3 text-lg"
            })}
          >
            {t("register")}
          </Link>
        </div>

      </section>
    </DefaultLayout>
  );
}
