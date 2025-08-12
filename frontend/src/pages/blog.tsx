import { Trans, useTranslation } from "react-i18next";

import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function DocsPage() {
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>
            <Trans t={t}>blog</Trans>
          </h1>
        </div>
      </section>
    </DefaultLayout>
  );
}
