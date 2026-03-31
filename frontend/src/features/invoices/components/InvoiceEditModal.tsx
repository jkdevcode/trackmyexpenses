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
import { useInvoiceErrorToast } from "../hooks/useInvoiceErrorToast";
import { useUpdateInvoiceMutation } from "../hooks/useInvoiceMutations";
import { formatCurrency } from "../utils/formatters";
import {
  calculateInvoiceItemTotal,
  getInvoiceItemUnitPrice,
} from "../utils/invoice-item";
import { useInvoiceFilter } from "../hooks/useInvoiceFilter";

import { InvoiceSearchInput } from "./InvoiceSearchInput";

import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "@/constants/currency";
import { useColorTheme } from "@/hooks/use-color-theme";
import { scrollToFirstError } from "@/utils/scrollToFirstError";

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
  const showInvoiceError = useInvoiceErrorToast();
  const updateMutation = useUpdateInvoiceMutation();
  const { appColor } = useColorTheme();

  const [form, setForm] = useState<InvoiceEditFormState>(initialFormState);
  const [items, setItems] = useState<InvoiceEditItemState[]>([]);
  const [formError, setFormError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(
    new Map(),
  );
  const [itemErrors, setItemErrors] = useState<Map<number, string>>(new Map());
  const warningShown = useRef(false);

  const currency = resolveCurrency(
    detailQuery.data?.moneda ?? detailQuery.data?.monedaBase,
  );

  const { filterValue, setFilterValue, filteredItems } = useInvoiceFilter({
    data: items,
    searchFn: (item, query) => item.nombre.toLowerCase().includes(query),
  });

  useEffect(() => {
    if (!isOpen) {
      setFilterValue("");
    }
  }, [isOpen, setFilterValue]);

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
      setFieldErrors(new Map());
      setItemErrors(new Map());
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
    setFieldErrors((prev) => {
      if (!prev.has(key)) {
        return prev;
      }

      const next = new Map(prev);

      next.delete(key);

      return next;
    });
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateItemField = (
    productoId: number,
    field: "cantidad" | "descuento" | "precioUnitario",
    value: string,
  ) => {
    setItemErrors((prev) => {
      if (!prev.has(productoId)) {
        return prev;
      }

      const next = new Map(prev);

      next.delete(productoId);

      return next;
    });

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
    setFieldErrors(new Map());
    setItemErrors(new Map());

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
      const {
        itemErrors: indexErrors,
        fieldErrors: nextFieldErrors,
        hasFieldErrors,
        message,
      } = showInvoiceError(error);

      const productoIdErrors = new Map<number, string>();

      indexErrors.forEach((itemMessage, index) => {
        const item = items[index];

        if (item) {
          productoIdErrors.set(item.productoId, itemMessage);
        }
      });

      setFieldErrors(nextFieldErrors);
      setItemErrors(productoIdErrors);
      setFormError(message);

      if (hasFieldErrors) {
        setTimeout(() => scrollToFirstError(), 100);
      }
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

              <div
                data-error-field={
                  fieldErrors.has("fechaHoraCompra")
                    ? "fechaHoraCompra"
                    : undefined
                }
              >
                <Input
                  color={appColor}
                  errorMessage={fieldErrors.get("fechaHoraCompra")}
                  isInvalid={fieldErrors.has("fechaHoraCompra")}
                  label={t("manual.fecha")}
                  type="date"
                  value={form.fechaHoraCompra}
                  variant="bordered"
                  onValueChange={(value) =>
                    updateField("fechaHoraCompra", value)
                  }
                />
              </div>

              <div
                data-error-field={
                  fieldErrors.has("metodoPago") ? "metodoPago" : undefined
                }
              >
                <Select
                  color={appColor}
                  errorMessage={fieldErrors.get("metodoPago")}
                  isInvalid={fieldErrors.has("metodoPago")}
                  label={t("manual.metodoPago")}
                  selectedKeys={[form.metodoPago]}
                  variant="bordered"
                  onChange={(event) =>
                    updateField(
                      "metodoPago",
                      event.target.value as PaymentMethod,
                    )
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
                  <SelectItem key="OTRO">
                    {t("common.other", "Otro")}
                  </SelectItem>
                </Select>
              </div>

              <div
                data-error-field={
                  fieldErrors.has("lugarCompra") ? "lugarCompra" : undefined
                }
              >
                <Input
                  color={appColor}
                  errorMessage={fieldErrors.get("lugarCompra")}
                  isInvalid={fieldErrors.has("lugarCompra")}
                  label={t("manual.lugarCompra")}
                  value={form.lugarCompra}
                  variant="bordered"
                  onValueChange={(value) => updateField("lugarCompra", value)}
                />
              </div>

              <div
                data-error-field={
                  fieldErrors.has("nitProveedor") ? "nitProveedor" : undefined
                }
              >
                <Input
                  color={appColor}
                  errorMessage={fieldErrors.get("nitProveedor")}
                  isInvalid={fieldErrors.has("nitProveedor")}
                  label={t("manual.nitProveedor")}
                  value={form.nitProveedor}
                  variant="bordered"
                  onValueChange={(value) => updateField("nitProveedor", value)}
                />
              </div>

              <div
                className="space-y-3 rounded-medium border border-default-200 p-4"
                data-error-field={
                  fieldErrors.has("items") ? "items" : undefined
                }
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{t("detail.items_aria")}</h3>
                  <InvoiceSearchInput
                    value={filterValue}
                    onValueChange={setFilterValue}
                  />
                </div>
                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const originalIndex = items.indexOf(item);
                    const rowError = itemErrors.get(item.productoId);

                    return (
                      <div
                        key={item.productoId}
                        className={`flex flex-col gap-3 rounded-medium border p-3 ${rowError ? "border-danger-200 bg-danger-50" : "border-default-100"}`}
                        data-error-field={
                          rowError ? `items[${originalIndex}]` : undefined
                        }
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold">
                              {item.nombre}
                            </p>
                            <p className="text-xs text-default-500">
                              {t("detail.table.cantidad")}: {item.cantidad}{" "}
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
                            errorMessage={rowError}
                            isInvalid={Boolean(rowError)}
                            label={t("detail.table.cantidad")}
                            min={1}
                            step="1"
                            type="number"
                            value={String(item.cantidad)}
                            variant="bordered"
                            onValueChange={(value) =>
                              updateItemField(
                                item.productoId,
                                "cantidad",
                                value,
                              )
                            }
                          />
                          <Input
                            color={appColor}
                            errorMessage={rowError}
                            isInvalid={Boolean(rowError)}
                            label={t("detail.table.descuento")}
                            min={0}
                            step="0.01"
                            type="number"
                            value={String(item.descuento)}
                            variant="bordered"
                            onValueChange={(value) =>
                              updateItemField(
                                item.productoId,
                                "descuento",
                                value,
                              )
                            }
                          />
                          <Input
                            color={appColor}
                            errorMessage={rowError}
                            isInvalid={Boolean(rowError)}
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
                        {rowError ? (
                          <p className="text-xs text-danger">{rowError}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end">
                  <p className="text-sm font-semibold">
                    {t("detail.total")}:{" "}
                    {formatCurrency(itemsTotal, i18n.language, currency)}
                  </p>
                </div>
              </div>

              {formError ? (
                <p
                  className="text-danger text-sm"
                  data-error-field={
                    fieldErrors.size === 0 && itemErrors.size === 0
                      ? "form-error"
                      : undefined
                  }
                >
                  {formError}
                </p>
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
