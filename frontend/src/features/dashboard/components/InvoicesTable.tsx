import { useState, useMemo } from "react";
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
import { Invoice } from "../hooks/useDashboardData";
import { appColor } from "@/theme/theme.config";

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="w-10/12 lg:w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t("table.title")}</h3>
      </div>
      <Table
        aria-label={t("table.title")}
        removeWrapper
        classNames={{
          th: `bg-default-100/50 text-${appColor} font-bold`,
          td: "py-3 border-b border-default-100 last:border-0",
        }}
        isStriped={false}
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
                onChange={(page: number) => setPage(page)}
              />
            </div>
          ) : null
        }
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
        <TableBody items={items} emptyContent={t("table.empty")}>
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
                            className="font-medium text-foreground text-sm truncate max-w-[120px] sm:max-w-xs"
                            title={item.provider}
                          >
                            {item.provider}
                          </span>
                          {/* Show status and date on mobile in subtitle line if removed from columns */}
                          <div className="flex sm:hidden gap-2 text-xs text-default-400">
                            <span>{formatDate(item.date)}</span>
                            <span>•</span>
                            <span
                              className={`text-${statusColorMap[item.status]}`}
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
                          {formatDate(item.date)}
                        </span>
                      </TableCell>
                    );
                  case "total":
                    return (
                      <TableCell>
                        <span
                          className={`font-semibold text-${appColor} whitespace-nowrap`}
                        >
                          {formatCurrency(item.total)}
                        </span>
                      </TableCell>
                    );
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
