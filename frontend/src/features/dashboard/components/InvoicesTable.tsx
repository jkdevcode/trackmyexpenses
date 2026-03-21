import type { Invoice } from "../types";

import { useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/table";
import { Pagination } from "@heroui/pagination";
import { Chip } from "@heroui/chip";
import { useTranslation } from "react-i18next";

import { formatCurrency, formatDate } from "../../invoices/utils/formatters";

import { appColor } from "@/theme/theme.config";
import { appColorVariants } from "@/theme/app-color-variants";
import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "@/constants/currency";

interface InvoicesTableProps {
  invoices: Invoice[];
  loading: boolean;
}

const statusColorMap: Record<
  string,
  "success" | "warning" | "danger" | "default"
> = {
  processed: "success",
  pending: "warning",
  error: "danger",
};

const statusTextClassMap: Record<string, string> = {
  processed: "text-success",
  pending: "text-warning",
  error: "text-danger",
};

const resolveCurrency = (value?: string | null) =>
  normalizeCurrencyCode(value, DEFAULT_CURRENCY);

export const InvoicesTable = ({ invoices, loading }: InvoicesTableProps) => {
  const { t, i18n } = useTranslation("dashboard");
  const [page, setPage] = useState(1);

  const rowsPerPage = 2;
  const pages = Math.ceil(invoices.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return invoices.slice(start, end);
  }, [page, invoices]);

  if (loading) {
    return (
      <div className="h-64 w-full animate-pulse bg-default-100 rounded-lg" />
    );
  }

  const columns = [
    { key: "provider", label: t("table.headers.provider") },
    { key: "date", label: t("table.headers.date") },
    { key: "total", label: t("table.headers.total") },
    { key: "status", label: t("table.headers.status") },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t("table.title")}</h3>
      </div>
      <Table
        removeWrapper
        aria-label={t("table.title")}
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color={appColor}
                page={page}
                total={pages}
                onChange={(nextPage: number) => setPage(nextPage)}
              />
            </div>
          ) : null
        }
        classNames={{
          th: `bg-default-100/50 ${appColorVariants.text} font-bold`,
          td: "py-3 border-b border-default-100 last:border-0",
        }}
        isStriped={false}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              className={
                column.key === "status" || column.key === "date"
                  ? "hidden sm:table-cell"
                  : ""
              }
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={t("table.empty")} items={items}>
          {(item: Invoice) => (
            <TableRow
              key={item.id}
              className="hover:bg-default-50 cursor-pointer transition-colors"
            >
              {(columnKey) => {
                const cellValue = getKeyValue(item, columnKey);

                switch (columnKey) {
                  case "provider":
                    return (
                      <TableCell>
                        <div className="flex flex-col">
                          <span
                            className="font-medium text-foreground text-sm truncate max-w-xs xl:max-w-44 2xl:max-w-64"
                            title={item.provider}
                          >
                            {item.provider}
                          </span>
                          <div className="flex sm:hidden gap-2 text-xs text-default-400">
                            <span>{formatDate(item.date, i18n.language)}</span>
                            <span>•</span>
                            <span
                              className={
                                statusTextClassMap[item.status] ??
                                "text-default-500"
                              }
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    );
                  case "date":
                    return (
                      <TableCell className="hidden sm:table-cell whitespace-nowrap">
                        <span className="text-default-500 text-sm">
                          {formatDate(item.date, i18n.language)}
                        </span>
                      </TableCell>
                    );
                  case "total": {
                    const currency = resolveCurrency(
                      item.moneda ?? item.monedaBase,
                    );
                    const baseCurrency = resolveCurrency(
                      item.monedaBase ?? currency,
                    );
                    const showBase = currency !== baseCurrency;
                    const baseTotal =
                      item.totalPagarBase !== null &&
                      item.totalPagarBase !== undefined
                        ? item.totalPagarBase
                        : item.total;

                    return (
                      <TableCell>
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold whitespace-nowrap ${appColorVariants.text}`}
                          >
                            {formatCurrency(
                              item.total,
                              i18n.language,
                              currency,
                            )}
                          </span>
                          {showBase ? (
                            <span className="text-xs text-default-500">
                              {formatCurrency(
                                baseTotal,
                                i18n.language,
                                baseCurrency,
                              )}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                    );
                  }
                  case "status":
                    return (
                      <TableCell className="hidden sm:table-cell">
                        <Chip
                          className="capitalize"
                          color={statusColorMap[item.status]}
                          size="sm"
                          variant="flat"
                        >
                          {cellValue}
                        </Chip>
                      </TableCell>
                    );
                  default:
                    return <TableCell>{cellValue}</TableCell>;
                }
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
