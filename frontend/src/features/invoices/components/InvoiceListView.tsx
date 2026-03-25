import type { InvoicePeriod } from "../types";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardBody } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";

import { useInvoicesQuery } from "../hooks/useInvoicesQuery";
import { useDeleteInvoiceMutation } from "../hooks/useInvoiceMutations";

import { InvoiceFilters } from "./InvoiceFilters";
import { InvoiceTable } from "./InvoiceTable";
import { InvoiceCardList } from "./InvoiceCardList";
import { InvoiceDetailModal } from "./InvoiceDetailModal";
import { InvoiceEditModal } from "./InvoiceEditModal";

import { useColorTheme } from "@/hooks/use-color-theme";

export const InvoiceListView = () => {
  const { t } = useTranslation("invoices");
  const queryClient = useQueryClient();
  const { appColor } = useColorTheme();

  const [period, setPeriod] = useState<InvoicePeriod>("month");
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

  const invoicesQuery = useInvoicesQuery(period);
  const deleteMutation = useDeleteInvoiceMutation();

  const invoices = useMemo(
    () => invoicesQuery.data ?? [],
    [invoicesQuery.data],
  );

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
    <div className="space-y-4 min-h-[520px]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-xl font-semibold">{t("list.title")}</h2>
        <div className="flex items-center gap-3">
          <InvoiceFilters period={period} onPeriodChange={setPeriod} />
          {invoicesQuery.isFetching ? (
            <Spinner color={appColor} size="sm" />
          ) : null}
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
              onDelete={handleDelete}
              onEdit={openEdit}
              onView={openDetail}
            />
          </div>

          <div className="block md:hidden">
            <InvoiceCardList
              invoices={invoices}
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
