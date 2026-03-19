import type { InvoiceDetail } from "../types";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";

import { useInvoiceDetailQuery } from "../hooks/useInvoicesQuery";
import { useUpdateInvoiceMutation } from "../hooks/useInvoiceMutations";
import { formatCurrency } from "../utils/formatters";
import {
  calculateInvoiceItemTotal,
  getInvoiceItemUnitPrice,
} from "../utils/invoice-item";

import { appColor } from "@/theme/theme.config";
import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "@/constants/currency";

const resolveCurrency = (value?: string | null) =>
  normalizeCurrencyCode(value, DEFAULT_CURRENCY);

type PaymentMethod =
  | "EFECTIVO"
  | "TARJETA_CREDITO"
  | "TARJETA_DEBITO"
  | "TRANSFERENCIA"
  | "OTRO";

type InvoiceEditModalProps = {
  invoiceId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

type InvoiceEditFormState = {
  metodoPago: PaymentMethod;
  lugarCompra: string;
  nitProveedor: string;
  fechaHoraCompra: string;
};

type InvoiceEditItemState = {
  productoId: number;
  nombre: string;
  cantidad: number;
  descuento: number;
  precioUnitario: string;
  precioTotal: number;
};

const toDateInputValue = (value: string) =>
  value ? new Date(value).toISOString().split("T")[0] : "";

const initialFormState: InvoiceEditFormState = {
  metodoPago: "EFECTIVO",
  lugarCompra: "",
  nitProveedor: "",
  fechaHoraCompra: "",
};

const mapDetailToForm = (detail: InvoiceDetail): InvoiceEditFormState => ({
  metodoPago: detail.metodoPago as PaymentMethod,
  lugarCompra: detail.lugarCompra ?? "",
  nitProveedor: detail.nitProveedor ?? "",
  fechaHoraCompra: toDateInputValue(detail.fechaHoraCompra),
});

export const InvoiceEditModal = ({
  invoiceId,
  isOpen,
  onClose,
  onSaved,
}: InvoiceEditModalProps) => {
  const { t, i18n } = useTranslation(["invoices", "validation"]);
  const detailQuery = useInvoiceDetailQuery(invoiceId, isOpen);
  const updateMutation = useUpdateInvoiceMutation();
  const [form, setForm] = useState<InvoiceEditFormState>(initialFormState);
  const [items, setItems] = useState<InvoiceEditItemState[]>([]);
  const [formError, setFormError] = useState<string>("");
  const warningShown = useRef(false);

  const currency = resolveCurrency(
    detailQuery.data?.moneda ?? detailQuery.data?.monedaBase,
  );

  useEffect(() => {
    if (detailQuery.data) {
      setForm(mapDetailToForm(detailQuery.data));
      setItems(
        detailQuery.data.productos.map((item) => ({
          productoId:
            item.productoId ?? item.producto?.id ?? item.producto?.id ?? 0,
          nombre: item.productoNombre ?? item.producto?.nombre ?? "",
          cantidad: item.cantidad,
          descuento: item.descuento ?? 0,
          precioUnitario: String(getInvoiceItemUnitPrice(item)),
          precioTotal: item.precioTotal,
        })),
      );
      setFormError("");
    }
  }, [detailQuery.data]);

  useEffect(() => {
    if (isOpen && detailQuery.data && !warningShown.current) {
      addToast({
        title: t("detail.edit_warning_title"),
        description: t("detail.edit_warning"),
        color: "warning",
        timeout: 4000,
      });
      warningShown.current = true;
    }

    if (!isOpen) {
      warningShown.current = false;
    }
  }, [isOpen, detailQuery.data, t]);

  const isSaving = updateMutation.isPending;

  const canSave = useMemo(
    () => Boolean(invoiceId) && !detailQuery.isLoading,
    [detailQuery.isLoading, invoiceId],
  );

  const itemsTotal = useMemo(
    () => items.reduce((acc, item) => acc + item.precioTotal, 0),
    [items],
  );

  const updateField = <K extends keyof InvoiceEditFormState>(
    key: K,
    value: InvoiceEditFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateItemField = (
    productoId: number,
    field: "cantidad" | "descuento" | "precioUnitario",
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productoId !== productoId) return item;

        const next = { ...item };

        if (field === "precioUnitario") {
          next.precioUnitario = value;
        } else {
          const parsed = Number(value);

          if (Number.isFinite(parsed)) {
            next[field] = parsed;
          }
        }

        const parsedPrice = Number(next.precioUnitario);

        if (Number.isFinite(parsedPrice) && parsedPrice > 0) {
          next.precioTotal = calculateInvoiceItemTotal(
            parsedPrice,
            next.cantidad,
            next.descuento,
          );
        }

        return next;
      }),
    );
  };

  const handleSave = async () => {
    if (!invoiceId) return;

    setFormError("");

    if (!form.lugarCompra.trim()) {
      const message = t("manual.validation.lugar_required");

      setFormError(message);
      addToast({
        title: t("toast.error"),
        description: message,
        color: "danger",
      });

      return;
    }

    try {
      const parsedItems = items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        descuento: item.descuento,
        precioUnitario: Number(item.precioUnitario),
      }));

      const invalidItem = parsedItems.find(
        (item) =>
          !Number.isFinite(item.precioUnitario) ||
          item.precioUnitario <= 0 ||
          !Number.isFinite(item.cantidad) ||
          item.cantidad <= 0 ||
          (item.descuento !== undefined &&
            (!Number.isFinite(item.descuento) ||
              item.descuento < 0 ||
              item.descuento > 100)),
      );

      if (invalidItem) {
        const message = t("validation.precioUnitario_invalid");

        setFormError(message);
        addToast({
          title: t("toast.error"),
          description: message,
          color: "danger",
        });

        return;
      }

      await updateMutation.mutateAsync({
        invoiceId,
        payload: {
          metodoPago: form.metodoPago,
          lugarCompra: form.lugarCompra.trim(),
          nitProveedor: form.nitProveedor.trim() || undefined,
          fechaHoraCompra: form.fechaHoraCompra
            ? new Date(form.fechaHoraCompra).toISOString()
            : undefined,
          ...(parsedItems.length > 0 ? { items: parsedItems } : {}),
        },
      });

      addToast({
        title: t("toast.success"),
        description: t("actions.edit"),
        color: "success",
      });

      onSaved();
      onClose();
    } catch (error) {
      void error;
      const message = t("detail.error");

      setFormError(message);
      addToast({
        title: t("toast.error"),
        description: message,
        color: "danger",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t("actions.edit")}</ModalHeader>
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
              <div className="rounded-medium border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
                {t("detail.edit_warning")}
              </div>

              <Input
                color={appColor}
                label={t("manual.fecha")}
                type="date"
                value={form.fechaHoraCompra}
                variant="bordered"
                onValueChange={(value) => updateField("fechaHoraCompra", value)}
              />

              <Select
                color={appColor}
                label={t("manual.metodoPago")}
                selectedKeys={[form.metodoPago]}
                variant="bordered"
                onChange={(event) =>
                  updateField("metodoPago", event.target.value as PaymentMethod)
                }
              >
                <SelectItem key="EFECTIVO">
                  {t("common.cash", "Efectivo")}
                </SelectItem>
                <SelectItem key="TARJETA_CREDITO">
                  {t("common.credit_card", "Tarjeta Credito")}
                </SelectItem>
                <SelectItem key="TARJETA_DEBITO">
                  {t("common.debit_card", "Tarjeta Debito")}
                </SelectItem>
                <SelectItem key="TRANSFERENCIA">
                  {t("common.transfer", "Transferencia")}
                </SelectItem>
                <SelectItem key="OTRO">{t("common.other", "Otro")}</SelectItem>
              </Select>

              <Input
                color={appColor}
                label={t("manual.lugarCompra")}
                value={form.lugarCompra}
                variant="bordered"
                onValueChange={(value) => updateField("lugarCompra", value)}
              />

              <Input
                color={appColor}
                label={t("manual.nitProveedor")}
                value={form.nitProveedor}
                variant="bordered"
                onValueChange={(value) => updateField("nitProveedor", value)}
              />

              <div className="space-y-3 rounded-medium border border-default-200 p-4">
                <h3 className="font-semibold">{t("detail.items_aria")}</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productoId}
                      className="flex flex-col gap-3 rounded-medium border border-default-100 p-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{item.nombre}</p>
                          <p className="text-xs text-default-500">
                            {t("detail.table.cantidad")}: {item.cantidad} �{" "}
                            {t("detail.table.descuento")}: {item.descuento}%
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatCurrency(
                            item.precioTotal,
                            i18n.language,
                            currency,
                          )}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          color={appColor}
                          label={t("detail.table.cantidad")}
                          min={1}
                          step="1"
                          type="number"
                          value={String(item.cantidad)}
                          variant="bordered"
                          onValueChange={(value) =>
                            updateItemField(item.productoId, "cantidad", value)
                          }
                        />
                        <Input
                          color={appColor}
                          label={t("detail.table.descuento")}
                          min={0}
                          step="0.01"
                          type="number"
                          value={String(item.descuento)}
                          variant="bordered"
                          onValueChange={(value) =>
                            updateItemField(item.productoId, "descuento", value)
                          }
                        />
                        <Input
                          color={appColor}
                          label={t("detail.table.precioUnitario")}
                          min={0.01}
                          step="0.01"
                          type="number"
                          value={item.precioUnitario}
                          variant="bordered"
                          onValueChange={(value) =>
                            updateItemField(
                              item.productoId,
                              "precioUnitario",
                              value,
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <p className="text-sm font-semibold">
                    {t("detail.total")}:{" "}
                    {formatCurrency(itemsTotal, i18n.language, currency)}
                  </p>
                </div>
              </div>

              {formError ? (
                <p className="text-danger text-sm">{formError}</p>
              ) : null}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t("detail.close")}
          </Button>
          <Button
            color={appColor}
            isDisabled={!canSave}
            isLoading={isSaving}
            onPress={handleSave}
          >
            {t("actions.edit")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
