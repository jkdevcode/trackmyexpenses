import type { InvoiceSummaryItem } from "../types";

import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";

import { formatCurrency, formatDate } from "../utils/formatters";

import { appColor } from "@/theme/theme.config";
import { appColorVariants } from "@/theme/app-color-variants";
import {
  DEFAULT_CURRENCY,
  normalizeCurrencyCode,
} from "@/constants/currency";

const resolveCurrency = (value?: string | null) =>
  normalizeCurrencyCode(value, DEFAULT_CURRENCY);

type InvoiceCardListProps = {
  invoices: InvoiceSummaryItem[];
  onView: (invoiceId: number) => void;
  onEdit: (invoiceId: number) => void;
  onDelete: (invoiceId: number) => void;
};

export const InvoiceCardList = ({
  invoices,
  onView,
  onEdit,
  onDelete,
}: InvoiceCardListProps) => {
  const { t, i18n } = useTranslation("invoices");

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => {
        const currency = resolveCurrency(invoice.moneda ?? invoice.monedaBase);
        const baseCurrency = resolveCurrency(invoice.monedaBase ?? currency);
        const showBase = currency !== baseCurrency;
        const baseTotal =
          invoice.totalPagarBase !== null && invoice.totalPagarBase !== undefined
            ? invoice.totalPagarBase
            : invoice.totalPagar;

        return (
          <Card key={invoice.id}>
            <CardBody className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs text-default-500">
                    {t("list.mobile.codigo")}
                  </p>
                  <p className="font-semibold">{invoice.codigoFactura}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${appColorVariants.textStrong}`}>
                    {formatCurrency(invoice.totalPagar, i18n.language, currency)}
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
      })}
    </div>
  );
};
