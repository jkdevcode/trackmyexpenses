import type { InvoiceDetail, InvoiceUnit, PaymentMethod } from "../../types";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { addToast } from "@heroui/toast";

import { useInvoiceDetailQuery } from "../../hooks/useInvoicesQuery";
import { useInvoiceErrorToast } from "../../hooks/useInvoiceErrorToast";
import { useUpdateInvoiceMutation } from "../../hooks/useInvoiceMutations";
import {
  calculateInvoiceItemTotal,
  getInvoiceItemUnitPrice,
} from "../../utils/invoice-item";
import {
  isValidInvoiceQuantity,
  normalizeInvoiceUnit,
} from "../../utils/invoice-quantity";
import { resolveInvoiceCurrency } from "../../utils/currency";
import {
  toInvoiceDateInputValue,
  toInvoiceUtcIsoString,
} from "../../utils/formatters";

import { scrollToFirstError } from "@/utils/scrollToFirstError";

type InvoiceEditFormState = {
  metodoPago: PaymentMethod;
  lugarCompra: string;
  nitProveedor: string;
  fechaHoraCompra: string;
};

export type InvoiceEditItemState = {
  productoId: number;
  nombre: string;
  cantidad: number;
  unidad: InvoiceUnit;
  descuento: number;
  precioUnitario: string;
  precioTotal: number;
};

const initialFormState: InvoiceEditFormState = {
  metodoPago: "EFECTIVO",
  lugarCompra: "",
  nitProveedor: "",
  fechaHoraCompra: "",
};

const mapDetailToForm = (detail: InvoiceDetail): InvoiceEditFormState => ({
  metodoPago: detail.metodoPago,
  lugarCompra: detail.lugarCompra ?? "",
  nitProveedor: detail.nitProveedor ?? "",
  fechaHoraCompra: toInvoiceDateInputValue(detail.fechaHoraCompra),
});

const mapDetailToEditItems = (detail: InvoiceDetail): InvoiceEditItemState[] =>
  detail.productos.map((item) => ({
    productoId: item.productoId ?? item.producto?.id ?? 0,
    nombre: item.productoNombre ?? item.producto?.nombre ?? "",
    cantidad: item.cantidad,
    unidad: normalizeInvoiceUnit(item.unidad),
    descuento: item.descuento ?? 0,
    precioUnitario: String(getInvoiceItemUnitPrice(item)),
    precioTotal: item.precioTotal,
  }));

const hasInvalidEditedItem = (
  items: Array<{
    cantidad: number;
    unidad?: string;
    descuento?: number;
    precioUnitario: number;
  }>,
) =>
  items.some(
    (item) =>
      !Number.isFinite(item.precioUnitario) ||
      item.precioUnitario <= 0 ||
      !isValidInvoiceQuantity(item.cantidad, item.unidad) ||
      (item.descuento !== undefined &&
        (!Number.isFinite(item.descuento) ||
          item.descuento < 0 ||
          item.descuento > 100)),
  );

interface UseInvoiceEditFormParams {
  invoiceId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const useInvoiceEditForm = ({
  invoiceId,
  isOpen,
  onClose,
  onSaved,
}: UseInvoiceEditFormParams) => {
  const { t } = useTranslation(["invoices", "validation"]);
  const detailQuery = useInvoiceDetailQuery(invoiceId, isOpen);
  const showInvoiceError = useInvoiceErrorToast();
  const updateMutation = useUpdateInvoiceMutation();
  const warningShown = useRef(false);

  const [form, setForm] = useState<InvoiceEditFormState>(initialFormState);
  const [items, setItems] = useState<InvoiceEditItemState[]>([]);
  const [formError, setFormError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(
    new Map(),
  );
  const [itemErrors, setItemErrors] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    if (detailQuery.data) {
      setForm(mapDetailToForm(detailQuery.data));
      setItems(mapDetailToEditItems(detailQuery.data));
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

  const currency = resolveInvoiceCurrency(
    detailQuery.data?.moneda ?? detailQuery.data?.monedaBase,
  );

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
    field: "cantidad" | "descuento" | "precioUnitario" | "unidad",
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
        } else if (field === "unidad") {
          next.unidad = normalizeInvoiceUnit(value);
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
        unidad: item.unidad,
        descuento: item.descuento,
        precioUnitario: Number(item.precioUnitario),
      }));

      if (hasInvalidEditedItem(parsedItems)) {
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
            ? toInvoiceUtcIsoString(form.fechaHoraCompra)
            : undefined,
          ...(parsedItems.length > 0 ? { items: parsedItems } : {}),
        },
      });

      addToast({
        title: t("toast.success"),
        description: t("actions.edit"),
        color: "success",
      });

      await onSaved();
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

  return {
    detailQuery,
    currency,
    form,
    items,
    formError,
    fieldErrors,
    itemErrors,
    isSaving,
    canSave,
    itemsTotal,
    updateField,
    updateItemField,
    handleSave,
  };
};
