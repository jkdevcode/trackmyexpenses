import { useTranslation } from "react-i18next";
import { Tabs, Tab } from "@heroui/tabs";

import { InvoiceListView } from "@/features/invoices/components/InvoiceListView";
import { ManualInvoiceForm } from "@/features/invoices/components/ManualInvoiceForm";
import { OcrInvoiceFlow } from "@/features/invoices/components/OcrInvoiceFlow";

export const NewInvoicePage = () => {
  const { t } = useTranslation("invoices");

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">
        {t("page.title", "Nueva Factura")}
      </h1>
      <Tabs aria-label={t("page.title")} variant="underlined">
        <Tab key="ocr" title={t("tabs.ocr")}>
          <div className="pt-4">
            <OcrInvoiceFlow />
          </div>
        </Tab>
        <Tab key="manual" title={t("tabs.manual")}>
          <div className="pt-4">
            <ManualInvoiceForm />
          </div>
        </Tab>
        <Tab key="list" title={t("tabs.list")}>
          <div className="pt-4">
            <InvoiceListView />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};
