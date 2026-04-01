import type { InvoiceSummaryItem } from "../../types";

import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

import { PaginatedItems } from "../../components/PaginatedItems";
import {
  getInvoiceBaseTotal,
  getInvoiceCurrencies,
} from "../../utils/currency";
import { formatCurrency, formatDate } from "../../utils/formatters";

import { useAppColorVariants } from "@/theme/app-color-variants";
import { useColorTheme } from "@/hooks/use-color-theme";

type InvoiceCardListProps = {
  invoices: InvoiceSummaryItem[];
  resetKey?: string;
  onView: (invoiceId: number) => void;
  onEdit: (invoiceId: number) => void;
  onDelete: (invoiceId: number) => void;
};

export const InvoiceCardList = ({
  invoices,
  resetKey,
  onView,
  onEdit,
  onDelete,
}: InvoiceCardListProps) => {
  const { t, i18n } = useTranslation("invoices");
  const { appColor } = useColorTheme();
  const appColorVariants = useAppColorVariants();

  return (
    <PaginatedItems
      items={invoices}
      itemsPerPage={10}
      resetKey={resetKey}
      renderList={(itemsContent, paginationContent) => (
        <div className="flex flex-col gap-4">
          <div className="space-y-3">{itemsContent}</div>
          {paginationContent}
        </div>
      )}
      renderItem={(invoice) => {
        const { currency, baseCurrency, showBase } = getInvoiceCurrencies(
          invoice.moneda,
          invoice.monedaBase,
        );
        const baseTotal = getInvoiceBaseTotal(
          invoice.totalPagar,
          invoice.totalPagarBase,
        );

        return (
          <Card key={invoice.id}>
            <CardBody className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-default-500">
                    {t("list.mobile.codigo")}
                  </p>
                  <p className="font-semibold">{invoice.codigoFactura}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${appColorVariants.textStrong}`}
                  >
                    {formatCurrency(
                      invoice.totalPagar,
                      i18n.language,
                      currency,
                    )}
                  </p>
                  {showBase ? (
                    <p className="text-xs text-default-500">
                      {formatCurrency(baseTotal, i18n.language, baseCurrency)}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="text-sm text-default-600">
                {formatDate(invoice.fechaHoraCompra, i18n.language)}
              </p>
              <p className="text-sm">{invoice.lugarCompra}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  color={appColor}
                  size="sm"
                  variant="flat"
                  onPress={() => onView(invoice.id)}
                >
                  {t("actions.view")}
                </Button>
                <Button
                  color={appColor}
                  size="sm"
                  variant="flat"
                  onPress={() => onEdit(invoice.id)}
                >
                  {t("actions.edit")}
                </Button>
                <Button
                  color="danger"
                  size="sm"
                  variant="flat"
                  onPress={() => onDelete(invoice.id)}
                >
                  {t("actions.delete")}
                </Button>
              </div>
            </CardBody>
          </Card>
        );
      }}
    />
  );
};
