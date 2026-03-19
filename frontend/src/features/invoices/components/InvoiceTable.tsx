import type { InvoiceSummaryItem } from "../types";

import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { formatCurrency, formatDate } from "../utils/formatters";

import { appColor } from "@/theme/theme.config";
import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "@/constants/currency";

const resolveCurrency = (value?: string | null) =>
  normalizeCurrencyCode(value, DEFAULT_CURRENCY);

type InvoiceTableProps = {
  invoices: InvoiceSummaryItem[];
  onView: (invoiceId: number) => void;
  onEdit: (invoiceId: number) => void;
  onDelete: (invoiceId: number) => void;
};

export const InvoiceTable = ({
  invoices,
  onView,
  onEdit,
  onDelete,
}: InvoiceTableProps) => {
  const { t, i18n } = useTranslation("invoices");

  return (
    <Table removeWrapper aria-label={t("list.table.aria")}>
      <TableHeader>
        <TableColumn>{t("list.table.columns.codigo")}</TableColumn>
        <TableColumn>{t("list.table.columns.fecha")}</TableColumn>
        <TableColumn>{t("list.table.columns.lugar")}</TableColumn>
        <TableColumn>{t("list.table.columns.metodo")}</TableColumn>
        <TableColumn>{t("list.table.columns.total")}</TableColumn>
        <TableColumn>{t("list.table.columns.accion")}</TableColumn>
      </TableHeader>
      <TableBody items={invoices}>
        {(invoice: InvoiceSummaryItem) => {
          const currency = resolveCurrency(
            invoice.moneda ?? invoice.monedaBase,
          );
          const baseCurrency = resolveCurrency(invoice.monedaBase ?? currency);
          const showBase = currency !== baseCurrency;
          const baseTotal =
            invoice.totalPagarBase !== null &&
            invoice.totalPagarBase !== undefined
              ? invoice.totalPagarBase
              : invoice.totalPagar;

          return (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.codigoFactura}</TableCell>
              <TableCell>
                {formatDate(invoice.fechaHoraCompra, i18n.language)}
              </TableCell>
              <TableCell>{invoice.lugarCompra}</TableCell>
              <TableCell>{t(`list.payment.${invoice.metodoPago}`)}</TableCell>
              <TableCell className="font-semibold">
                <div className="flex flex-col">
                  <span>
                    {formatCurrency(
                      invoice.totalPagar,
                      i18n.language,
                      currency,
                    )}
                  </span>
                  {showBase ? (
                    <span className="text-xs text-default-500">
                      {formatCurrency(baseTotal, i18n.language, baseCurrency)}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly
                    aria-label={t("actions.view")}
                    color={appColor}
                    size="sm"
                    variant="light"
                    onPress={() => onView(invoice.id)}
                  >
                    <EyeIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label={t("actions.edit")}
                    color={appColor}
                    size="sm"
                    variant="light"
                    onPress={() => onEdit(invoice.id)}
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    isIconOnly
                    aria-label={t("actions.delete")}
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={() => onDelete(invoice.id)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
};
