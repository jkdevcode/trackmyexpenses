import { lazy, Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, Tab } from "@heroui/tabs";

const OcrInvoiceFlow = lazy(() =>
  import("@/features/invoices/components/OcrInvoiceFlow").then((module) => ({
    default: module.OcrInvoiceFlow,
  })),
);
const ManualInvoiceForm = lazy(() =>
  import("@/features/invoices/components/ManualInvoiceForm").then((module) => ({
    default: module.ManualInvoiceForm,
  })),
);
const InvoiceListView = lazy(() =>
  import("@/features/invoices/components/InvoiceListView").then((module) => ({
    default: module.InvoiceListView,
  })),
);

type InvoiceTabKey = "ocr" | "manual" | "list";

export const NewInvoicePage = () => {
  const { t } = useTranslation("invoices");
  const [activeTab, setActiveTab] = useState<InvoiceTabKey>("ocr");

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">
        {t("page.title", "Nueva Factura")}
      </h1>
      <Tabs
        aria-label={t("page.title")}
        selectedKey={activeTab}
        variant="underlined"
        disableAnimation
        onSelectionChange={(key) => setActiveTab(key as InvoiceTabKey)}
      >
        <Tab key="ocr" title={t("tabs.ocr")}>
          {activeTab === "ocr" ? (
            <div className="pt-4">
              <Suspense
                fallback={
                  <div className="py-8 text-center text-default-500">
                    Cargando...
                  </div>
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
                  <div className="py-8 text-center text-default-500">
                    Cargando...
                  </div>
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
                  <div className="py-8 text-center text-default-500">
                    Cargando...
                  </div>
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
