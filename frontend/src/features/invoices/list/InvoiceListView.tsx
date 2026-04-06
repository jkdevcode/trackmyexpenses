import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";

import { useInvoiceFilters } from "../hooks/useInvoiceFilters";
import { useInvoicesQuery } from "../hooks/useInvoicesQuery";
import { useDeleteInvoiceMutation } from "../hooks/useInvoiceMutations";
import { useInvoiceFilter } from "../hooks/useInvoiceFilter";
import { InvoiceSearchInput } from "../components/InvoiceSearchInput";

import { InvoiceFilters } from "./components/InvoiceFilters";
import { InvoiceTable } from "./components/InvoiceTable";
import { InvoiceCardList } from "./components/InvoiceCardList";
import { InvoiceDetailModal } from "./components/InvoiceDetailModal";
import { InvoiceEditModal } from "./components/InvoiceEditModal";

import { useColorTheme } from "@/hooks/use-color-theme";

export const InvoiceListView = () => {
  const { t } = useTranslation("invoices");
  const queryClient = useQueryClient();
  const { appColor } = useColorTheme();

  const { filter, dateRangeValue, setDateRangeValue, setPeriod } =
    useInvoiceFilters({ period: "month" });
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const skeletonKeys = [
    "skeleton-1",
    "skeleton-2",
    "skeleton-3",
    "skeleton-4",
    "skeleton-5",
  ];

  const invoicesQuery = useInvoicesQuery(filter);
  const deleteMutation = useDeleteInvoiceMutation();

  const {
    filterValue,
    setFilterValue,
    filteredItems: invoices,
  } = useInvoiceFilter({
    data: invoicesQuery.data ?? [],
    searchFn: (item, query) => {
      return (
        item.codigoFactura.toLowerCase().includes(query) ||
        item.lugarCompra.toLowerCase().includes(query) ||
        String(item.totalPagar).includes(query) ||
        item.fechaHoraCompra.toLowerCase().includes(query)
      );
    },
  });

  const openDetail = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailOpen(true);
  };

  const openEdit = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setIsEditOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedInvoiceId(null);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setSelectedInvoiceId(null);
  };

  const handleDelete = async (invoiceId: number) => {
    const confirmed = window.confirm(t("confirmDelete"));

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(invoiceId);
      addToast({
        title: t("toast.success"),
        description: t("actions.delete"),
        color: "success",
      });
      await queryClient.invalidateQueries({ queryKey: ["facturas"] });
    } catch (error) {
      void error;
      addToast({
        title: t("toast.error"),
        description: t("list.error"),
        color: "danger",
      });
    }
  };

  const handleSaved = async () => {
    await queryClient.invalidateQueries({ queryKey: ["facturas"] });
    if (selectedInvoiceId !== null) {
      await queryClient.invalidateQueries({
        queryKey: ["factura-detail", selectedInvoiceId],
      });
    }
  };

  return (
    <div className="space-y-6 min-h-130">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold tracking-tight">{t("list.title")}</h2>

        {/* Row 2: Date Filters (Full width, Tabs left, Custom right) */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1">
            <InvoiceFilters
              dateRangeValue={dateRangeValue}
              filter={filter}
              onDateRangeChange={setDateRangeValue}
              onPeriodChange={setPeriod}
            />
          </div>
          {invoicesQuery.isFetching && <Spinner color={appColor} size="sm" />}
        </div>

        {/* Row 3: Search Input */}
        <div className="w-full md:max-w-xl">
          <InvoiceSearchInput
            value={filterValue}
            onValueChange={setFilterValue}
          />
        </div>
      </div>

      {invoicesQuery.isError ? (
        <Card>
          <CardBody className="py-10 text-center text-danger">
            {t("list.error")}
          </CardBody>
        </Card>
      ) : null}

      {invoicesQuery.isLoading ? (
        <div className="space-y-3">
          {skeletonKeys.map((key) => (
            <div
              key={key}
              className="h-16 rounded-large bg-default-100 animate-pulse"
            />
          ))}
        </div>
      ) : null}

      {!invoicesQuery.isLoading &&
      !invoicesQuery.isError &&
      invoices.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center text-default-500">
            {t("empty")}
          </CardBody>
        </Card>
      ) : null}

      {!invoicesQuery.isLoading &&
      !invoicesQuery.isError &&
      invoices.length > 0 ? (
        <>
          <div className="hidden md:block">
            <InvoiceTable
              invoices={invoices}
              resetKey={filterValue}
              onDelete={handleDelete}
              onEdit={openEdit}
              onView={openDetail}
            />
          </div>

          <div className="block md:hidden">
            <InvoiceCardList
              invoices={invoices}
              resetKey={filterValue}
              onDelete={handleDelete}
              onEdit={openEdit}
              onView={openDetail}
            />
          </div>
        </>
      ) : null}

      <InvoiceDetailModal
        invoiceId={selectedInvoiceId}
        isOpen={isDetailOpen}
        onClose={closeDetail}
      />

      <InvoiceEditModal
        invoiceId={selectedInvoiceId}
        isOpen={isEditOpen}
        onClose={closeEdit}
        onSaved={handleSaved}
      />
    </div>
  );
};
