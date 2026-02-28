import type { InvoicePeriod, InvoiceSummaryItem } from "../types";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectItem } from "@heroui/select";
import { Card, CardBody } from "@heroui/card";
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
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { EyeIcon } from "@heroicons/react/24/outline";

import {
  useInvoiceDetailQuery,
  useInvoicesQuery,
} from "../hooks/useInvoicesQuery";

import { appColor } from "@/theme/theme.config";

const PERIOD_OPTIONS: { key: InvoicePeriod; labelKey: string }[] = [
  { key: "day", labelKey: "list.period.day" },
  { key: "week", labelKey: "list.period.week" },
  { key: "month", labelKey: "list.period.month" },
  { key: "year", labelKey: "list.period.year" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const InvoiceListView = () => {
  const { t, i18n } = useTranslation("invoices");
  const [period, setPeriod] = useState<InvoicePeriod>("month");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const invoicesQuery = useInvoicesQuery(period);
  const detailQuery = useInvoiceDetailQuery(selectedInvoiceId, isDetailOpen);

  const invoices = useMemo(
    () => invoicesQuery.data ?? [],
    [invoicesQuery.data],
  );

  const openDetail = (invoiceId: number) => {
    setSelectedInvoiceId(invoiceId);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedInvoiceId(null);
  };

  return (
    <div className="space-y-4 min-h-[520px]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-xl font-semibold">{t("list.title")}</h2>
        <div className="flex items-center gap-3">
          <Select
            aria-label={t("list.period.label")}
            className="w-full md:w-56"
            color={appColor}
            label={t("list.period.label")}
            selectedKeys={[period]}
            size="sm"
            variant="bordered"
            onChange={(event) => setPeriod(event.target.value as InvoicePeriod)}
          >
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.key}>{t(option.labelKey)}</SelectItem>
            ))}
          </Select>
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
          {[...Array(5)].map((_, index) => (
            <div
              key={`skeleton-${index}`}
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
            {t("list.empty")}
          </CardBody>
        </Card>
      ) : null}

      {!invoicesQuery.isLoading &&
      !invoicesQuery.isError &&
      invoices.length > 0 ? (
        <>
          <div className="hidden md:block">
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
                {(invoice: InvoiceSummaryItem) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.codigoFactura}</TableCell>
                    <TableCell>
                      {formatDate(invoice.fechaHoraCompra, i18n.language)}
                    </TableCell>
                    <TableCell>{invoice.lugarCompra}</TableCell>
                    <TableCell>
                      {t(`list.payment.${invoice.metodoPago}`)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.totalPagar)}
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        aria-label={t("list.actions.view_detail")}
                        color={appColor}
                        size="sm"
                        variant="light"
                        onPress={() => openDetail(invoice.id)}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="block md:hidden space-y-3">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardBody className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs text-default-500">
                        {t("list.mobile.codigo")}
                      </p>
                      <p className="font-semibold">{invoice.codigoFactura}</p>
                    </div>
                    <p className={`text-lg font-bold text-${appColor}-600`}>
                      {formatCurrency(invoice.totalPagar)}
                    </p>
                  </div>
                  <p className="text-sm text-default-600">
                    {formatDate(invoice.fechaHoraCompra, i18n.language)}
                  </p>
                  <p className="text-sm">{invoice.lugarCompra}</p>
                  <Button
                    color={appColor}
                    size="sm"
                    variant="flat"
                    onPress={() => openDetail(invoice.id)}
                  >
                    {t("list.actions.view_detail")}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </>
      ) : null}

      <Modal
        isOpen={isDetailOpen}
        scrollBehavior="inside"
        size="4xl"
        onClose={closeDetail}
      >
        <ModalContent>
          <ModalHeader>{t("detail.title")}</ModalHeader>
          <ModalBody>
            {detailQuery.isLoading ? (
              <div className="py-10 flex justify-center">
                <Spinner color={appColor} />
              </div>
            ) : null}

            {detailQuery.isError ? (
              <p className="text-danger">{t("detail.error")}</p>
            ) : null}

            {!detailQuery.isLoading &&
            !detailQuery.isError &&
            detailQuery.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="font-semibold">{t("detail.codigo")}:</span>{" "}
                    {detailQuery.data.codigoFactura}
                  </p>
                  <p>
                    <span className="font-semibold">{t("detail.fecha")}:</span>{" "}
                    {formatDate(
                      detailQuery.data.fechaHoraCompra,
                      i18n.language,
                    )}
                  </p>
                  <p>
                    <span className="font-semibold">{t("detail.metodo")}:</span>{" "}
                    {t(`list.payment.${detailQuery.data.metodoPago}`)}
                  </p>
                  <p>
                    <span className="font-semibold">{t("detail.lugar")}:</span>{" "}
                    {detailQuery.data.lugarCompra}
                  </p>
                  <p>
                    <span className="font-semibold">{t("detail.nit")}:</span>{" "}
                    {detailQuery.data.nitProveedor || "-"}
                  </p>
                  <p>
                    <span className="font-semibold">
                      {t("detail.usuario")}:
                    </span>{" "}
                    {detailQuery.data.usuario.nombres}{" "}
                    {detailQuery.data.usuario.apellidos}
                  </p>
                </div>

                <Table removeWrapper aria-label={t("detail.items_aria")}>
                  <TableHeader>
                    <TableColumn>{t("detail.table.producto")}</TableColumn>
                    <TableColumn>{t("detail.table.cantidad")}</TableColumn>
                    <TableColumn>
                      {t("detail.table.precioUnitario")}
                    </TableColumn>
                    <TableColumn>{t("detail.table.descuento")}</TableColumn>
                    <TableColumn>{t("detail.table.precioTotal")}</TableColumn>
                  </TableHeader>
                  <TableBody items={detailQuery.data.productos}>
                    {(item) => (
                      <TableRow
                        key={`${item.producto.id}-${item.cantidad}-${item.precioTotal}`}
                      >
                        <TableCell>{item.producto.nombre}</TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell>
                          {formatCurrency(item.producto.precioUnitario)}
                        </TableCell>
                        <TableCell>{item.descuento ?? 0}%</TableCell>
                        <TableCell>
                          {formatCurrency(item.precioTotal)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : null}
          </ModalBody>
          <ModalFooter className="justify-between">
            <Button variant="light" onPress={closeDetail}>
              {t("detail.close")}
            </Button>
            {detailQuery.data ? (
              <p className={`text-xl font-bold text-${appColor}-600`}>
                {t("detail.total")}:{" "}
                {formatCurrency(detailQuery.data.totalPagar)}
              </p>
            ) : null}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
