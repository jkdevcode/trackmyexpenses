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

import { formatCurrency, formatDate } from "../utils/formatters";

import { PaginatedItems } from "./PaginatedItems";

import { EyeFilledIcon, EditIcon, DeleteIcon } from "@/components/ui/icons";
import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "@/constants/currency";
import { useColorTheme } from "@/hooks/use-color-theme";

const resolveCurrency = (value?: string | null) =>
  normalizeCurrencyCode(value, DEFAULT_CURRENCY);

type InvoiceTableProps = {
  invoices: InvoiceSummaryItem[];
  resetKey?: string;
  onView: (invoiceId: number) => void;
  onEdit: (invoiceId: number) => void;
  onDelete: (invoiceId: number) => void;
};

export const InvoiceTable = ({
  invoices,
  resetKey,
  onView,
  onEdit,
  onDelete,
}: InvoiceTableProps) => {
  const { t, i18n } = useTranslation("invoices");
  const { appColor } = useColorTheme();

  return (
    <PaginatedItems
      items={invoices}
      itemsPerPage={10}
      resetKey={resetKey}
      renderList={(itemsContent, paginationContent) => (
        <Table
          removeWrapper
          aria-label={t("list.table.aria")}
          bottomContent={paginationContent}
        >
          <TableHeader>
            <TableColumn>{t("list.table.columns.codigo")}</TableColumn>
            <TableColumn>{t("list.table.columns.fecha")}</TableColumn>
            <TableColumn>{t("list.table.columns.lugar")}</TableColumn>
            <TableColumn>{t("list.table.columns.metodo")}</TableColumn>
            <TableColumn>{t("list.table.columns.total")}</TableColumn>
            <TableColumn>{t("list.table.columns.accion")}</TableColumn>
          </TableHeader>
          <TableBody>{itemsContent as any}</TableBody>
        </Table>
      )}
      renderItem={(invoice: InvoiceSummaryItem) => {
        const currency = resolveCurrency(invoice.moneda ?? invoice.monedaBase);
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
                  {formatCurrency(invoice.totalPagar, i18n.language, currency)}
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
                  <EyeFilledIcon className="text-lg text-default-400 pointer-events-none" />
                </Button>
                <Button
                  isIconOnly
                  aria-label={t("actions.edit")}
                  color={appColor}
                  size="sm"
                  variant="light"
                  onPress={() => onEdit(invoice.id)}
                >
                  <EditIcon className="text-lg text-default-400 pointer-events-none" />
                </Button>
                <Button
                  isIconOnly
                  aria-label={t("actions.delete")}
                  color="danger"
                  size="sm"
                  variant="light"
                  onPress={() => onDelete(invoice.id)}
                >
                  <DeleteIcon className="text-lg pointer-events-none" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      }}
    />
  );
};
