import { Trans, useTranslation } from "react-i18next";
import { button as buttonStyles } from "@heroui/theme";
import { Link } from "@heroui/link";
/* import imgs from "../styles/imgs"; */

import { title, subtitle } from "@/components/ui/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section
        className="flex flex-col items-center justify-center gap-6 py-16 md:py-24 
                  bg-cover bg-center bg-no-repeat relative"
        /* style={{ backgroundImage: `url(${imgs.imgPrincipalPets})` }} */
      >
        {/* Capa de oscurecimiento para que el texto sea legible */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Contenido encima del fondo */}
        <div className="relative z-10 text-center">
          <h1 className={title()}>
            {t("welcome-to")}&nbsp;
            <span className={title({ color: "violet" })}>{t("my-app")}</span>
          </h1>
          <p className={subtitle({ class: "mt-4 text-gray-200" })}>
            <Trans i18nKey="start-your-journey-with-us" />
          </p>
        </div>

        {/* Botones */}
        <div className="relative z-10 flex gap-4 mt-6">
          <Link
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
              class: "px-6 py-3 text-lg",
            })}
            href="/login"
          >
            {t("login")}
          </Link>

          <Link
            className={buttonStyles({
              variant: "bordered",
              radius: "full",
              class: "px-6 py-3 text-lg text-white border-white",
            })}
            href="/register"
          >
            {t("register")}
          </Link>
        </div>
      </section>
    </DefaultLayout>
  );
}
