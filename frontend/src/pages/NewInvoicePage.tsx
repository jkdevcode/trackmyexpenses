import { lazy, Suspense, useEffect } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { usePageMeta } from "@/hooks/usePageMeta";

const OcrInvoiceFlow = lazy(() =>
  import("@/features/invoices/ocr/OcrInvoiceFlow").then((module) => ({
    default: module.OcrInvoiceFlow,
  })),
);
const ManualInvoiceForm = lazy(() =>
  import("@/features/invoices/manual/ManualInvoiceForm").then((module) => ({
    default: module.ManualInvoiceForm,
  })),
);
const InvoiceListView = lazy(() =>
  import("@/features/invoices/list/InvoiceListView").then((module) => ({
    default: module.InvoiceListView,
  })),
);

type InvoiceTabKey = "ocr" | "manual" | "list";
const validTabs: InvoiceTabKey[] = ["ocr", "manual", "list"];

export const NewInvoicePage = () => {
  const { t } = useTranslation(["invoices", "common"]);
  const { t: tMeta } = useTranslation("meta");

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as InvoiceTabKey | null;

  const activeTab: InvoiceTabKey =
    tabParam && validTabs.includes(tabParam) ? tabParam : "ocr";

  useEffect(() => {
    if (tabParam !== null && !validTabs.includes(tabParam)) {
      setSearchParams({ tab: "ocr" }, { replace: true });
    }
  }, [tabParam, setSearchParams]);

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const metaByTab = {
    ocr: {
      title: tMeta("ocr.title"),
      description: tMeta("ocr.description"),
    },
    manual: {
      title: tMeta("manual.title"),
      description: tMeta("manual.description"),
    },
    list: {
      title: tMeta("invoices.title"),
      description: tMeta("invoices.description"),
    },
  };

  const currentMeta = metaByTab[activeTab];

  usePageMeta({
    title: currentMeta.title,
    description: currentMeta.description,
  });

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t("page.title")}</h1>
      <Tabs
        aria-label={t("page.title")}
        selectedKey={activeTab}
        variant="underlined"
        disableAnimation
        onSelectionChange={(key) => handleTabChange(key as string)}
      >
        <Tab key="ocr" title={t("tabs.ocr")}>
          {activeTab === "ocr" ? (
            <div className="pt-4">
              <Suspense
                fallback={
                  <LoadingSpinner message={t("common:loading.basic")} />
                }
              >
                <OcrInvoiceFlow />
              </Suspense>
            </div>
          ) : null}
        </Tab>
        <Tab key="manual" title={t("tabs.manual")}>
          {activeTab === "manual" ? (
            <div className="pt-4">
              <Suspense
                fallback={
                  <LoadingSpinner message={t("common:loading.basic")} />
                }
              >
                <ManualInvoiceForm />
              </Suspense>
            </div>
          ) : null}
        </Tab>
        <Tab key="list" title={t("tabs.list")}>
          {activeTab === "list" ? (
            <div className="pt-4">
              <Suspense
                fallback={
                  <LoadingSpinner message={t("common:loading.basic")} />
                }
              >
                <InvoiceListView />
              </Suspense>
            </div>
          ) : null}
        </Tab>
      </Tabs>
    </div>
  );
};
