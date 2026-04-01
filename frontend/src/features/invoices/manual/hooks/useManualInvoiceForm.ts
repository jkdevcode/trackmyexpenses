import type {
  CreateFacturaDto,
  ProductCatalogItem,
} from "@/features/invoices/types";
import type { ManualInvoiceFormState, ManualInvoiceItem } from "../types";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";
import { useQueryClient } from "@tanstack/react-query";

import {
  useCreateInvoiceMutation,
  useProductsQuery,
} from "../../hooks/useInvoiceMutations";
import { useInvoiceErrorToast } from "../../hooks/useInvoiceErrorToast";
import { calculateInvoiceItemTotal } from "../../utils/invoice-item";
import { formatCurrency } from "../../utils/formatters";

import { scrollToFirstError } from "@/utils/scrollToFirstError";
import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "@/constants/currency";
import { useSession } from "@/contexts/session-context";

const CREATE_PRODUCT_KEY = "__create__";

const initialState: ManualInvoiceFormState = {
  fecha: new Date().toISOString().split("T")[0],
  metodoPago: "EFECTIVO",
  lugarCompra: "",
  nitProveedor: "",
  moneda: "", // Will be initialized with base currency
  tasaCambio: "",
};

export const useManualInvoiceForm = () => {
  const { t, i18n } = useTranslation(["invoices", "common", "validation"]);
  const { user } = useSession();
  const createInvoiceMutation = useCreateInvoiceMutation();
  const productsQuery = useProductsQuery();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const showInvoiceError = useInvoiceErrorToast();

  const baseCurrency = normalizeCurrencyCode(
    user?.monedaBase,
    DEFAULT_CURRENCY,
  );

  // --- State ---
  const [form, setForm] = useState<ManualInvoiceFormState>({
    ...initialState,
    moneda: baseCurrency,
  });
  const [formError, setFormError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Map<string, string>>(
    new Map(),
  );
  const [items, setItems] = useState<ManualInvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [itemCantidad, setItemCantidad] = useState<string>("1");
  const [itemDescuento, setItemDescuento] = useState<string>("");
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [itemErrors, setItemErrors] = useState<Map<number, string>>(new Map());

  // --- Memoized Values ---
  const productOptions = useMemo(() => {
    const search = inputText.toLowerCase().trim();

    const options = (productsQuery.data ?? [])
      .filter((product) => {
        if (!search) return true;
        const searchNombre = product.nombre.toLowerCase().includes(search);
        const searchCodigo = product.codigo?.toLowerCase().includes(search);

        return searchNombre || searchCodigo;
      })
      .map((product) => ({
        key: String(product.id),
        label: `${product.nombre}${product.codigo ? ` (${product.codigo})` : ""} - ${formatCurrency(
          product.precioUnitario,
          i18n.language,
          form.moneda,
        )}`,
        textValue: `${product.nombre}${product.codigo ? ` ${product.codigo}` : ""}`,
        isSpecial: false,
      }));

    return [
      {
        key: CREATE_PRODUCT_KEY,
        label: inputText
          ? `Crear "${inputText}"`
          : t("manual.items.create_product"),
        textValue: inputText || CREATE_PRODUCT_KEY,
        isSpecial: true,
      },
      ...options,
    ];
  }, [productsQuery.data, t, i18n.language, form.moneda, inputText]);

  const totalCalculado = useMemo(
    () => items.reduce((acc, item) => acc + item.subtotal, 0),
    [items],
  );

  const showConversion = form.moneda !== baseCurrency;
  const parsedRate = Number(form.tasaCambio);
  const rateIsValid = Number.isFinite(parsedRate) && parsedRate > 0;

  const totalBase = useMemo(() => {
    if (!showConversion) return totalCalculado;
    if (!rateIsValid) return null;

    return (
      Math.round((totalCalculado * parsedRate + Number.EPSILON) * 100) / 100
    );
  }, [showConversion, rateIsValid, totalCalculado, parsedRate]);

  // --- Handlers ---
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev.has(field)) return prev;
      const next = new Map(prev);

      next.delete(field);

      return next;
    });
  };

  const updateField = (key: keyof ManualInvoiceFormState, value: string) => {
    if (key === "fecha") {
      clearFieldError("fechaHoraCompra");
    } else {
      clearFieldError(key);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): string | null => {
    if (!form.fecha) return t("manual.validation.fecha_required");
    if (!form.lugarCompra.trim()) return t("manual.validation.lugar_required");
    if (items.length === 0) {
      return t("manual.validation.items_required");
    }

    const invalidItem = items.find(
      (item) =>
        !Number.isFinite(item.cantidad) ||
        item.cantidad <= 0 ||
        (item.descuento !== undefined &&
          (!Number.isFinite(item.descuento) ||
            item.descuento < 0 ||
            item.descuento > 100)),
    );

    if (invalidItem) {
      return t("manual.validation.item_invalid");
    }

    return null;
  };

  const handleAddItem = () => {
    const productId = Number(selectedProductId);
    const cantidad = Number(itemCantidad);
    const descuento = itemDescuento === "" ? undefined : Number(itemDescuento);

    if (!productId) {
      setFormError(t("manual.validation.product_required"));

      return;
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      setFormError(t("manual.validation.cantidad_invalid"));

      return;
    }

    if (
      descuento !== undefined &&
      (!Number.isFinite(descuento) || descuento < 0 || descuento > 100)
    ) {
      setFormError(t("manual.validation.descuento_invalid"));

      return;
    }

    if (items.some((item) => item.productoId === productId)) {
      setFormError(t("manual.validation.item_duplicate"));

      return;
    }

    const selectedProduct = (productsQuery.data ?? []).find(
      (product: ProductCatalogItem) => product.id === productId,
    );

    if (!selectedProduct) {
      setFormError(t("manual.validation.product_not_found"));

      return;
    }

    const subtotal = calculateInvoiceItemTotal(
      selectedProduct.precioUnitario,
      cantidad,
      descuento ?? 0,
    );

    setItems((prev) => [
      ...prev,
      {
        productoId: selectedProduct.id,
        nombre: selectedProduct.nombre,
        precioUnitario: selectedProduct.precioUnitario,
        cantidad,
        descuento,
        subtotal,
      },
    ]);
    clearFieldError("items");
    setSelectedProductId("");
    setItemCantidad("1");
    setItemDescuento("");
    setFormError("");
  };

  const updateItemField = (
    productoId: number,
    field: "cantidad" | "descuento",
    value: string,
  ) => {
    const parsed = Number(value);

    setItemErrors((prev) => {
      const next = new Map(prev);

      next.delete(productoId);

      return next;
    });
    clearFieldError("items");

    setItems((prev) =>
      prev.map((item) => {
        if (item.productoId !== productoId) return item;

        const next = {
          ...item,
          [field]: Number.isFinite(parsed) ? parsed : item[field],
        } as ManualInvoiceItem;

        next.subtotal = calculateInvoiceItemTotal(
          next.precioUnitario,
          next.cantidad,
          next.descuento ?? 0,
        );

        return next;
      }),
    );
  };

  const handleRemoveItem = (productoId: number) => {
    setItems((prev) => prev.filter((item) => item.productoId !== productoId));
    setItemErrors((prev) => {
      const next = new Map(prev);

      next.delete(productoId);

      return next;
    });
    clearFieldError("items");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setFieldErrors(new Map());
    setItemErrors(new Map());

    const validationError = validate();

    if (validationError) {
      setFormError(validationError);
      addToast({
        title: t("toast.error"),
        description: validationError,
        color: "danger",
      });

      return;
    }

    const rateToSend =
      form.moneda === baseCurrency
        ? undefined
        : rateIsValid
          ? parsedRate
          : undefined;

    const payload: CreateFacturaDto = {
      fechaHoraCompra: form.fecha
        ? new Date(form.fecha).toISOString()
        : undefined,
      metodoPago: form.metodoPago,
      lugarCompra: form.lugarCompra.trim(),
      nitProveedor: form.nitProveedor.trim() || undefined,
      moneda: form.moneda,
      tasaCambio: rateToSend,
      items: items.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        descuento: item.descuento,
      })),
    };

    try {
      await createInvoiceMutation.mutateAsync(payload);
      addToast({
        title: t("toast.success"),
        description: t("manual.success"),
        color: "success",
      });
      navigate("/dashboard");
    } catch (error) {
      const {
        itemErrors: indexErrors,
        fieldErrors: nextFieldErrors,
        hasFieldErrors,
        message,
      } = showInvoiceError(error);

      setFieldErrors(nextFieldErrors);
      setFormError(indexErrors.size === 0 ? message : "");

      if (hasFieldErrors) {
        const productoIdErrors = new Map<number, string>();

        indexErrors.forEach((msg, idx) => {
          const item = items[idx];

          if (item) productoIdErrors.set(item.productoId, msg);
        });
        setItemErrors(productoIdErrors);
        setTimeout(() => scrollToFirstError(), 100);
      }
    }
  };

  const handleProductCreated = (product: ProductCatalogItem) => {
    queryClient.setQueryData<ProductCatalogItem[]>(["productos"], (prev) => {
      const existing = prev ?? [];

      if (existing.some((item) => item.id === product.id)) return existing;

      return [...existing, product].sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );
    });

    setSelectedProductId(String(product.id));
    setIsCreateProductOpen(false);
  };

  return {
    // State
    form,
    items,
    formError,
    fieldErrors,
    itemErrors,
    selectedProductId,
    itemCantidad,
    itemDescuento,
    isCreateProductOpen,
    inputText,
    totalCalculado,
    totalBase,
    showConversion,
    baseCurrency,
    productOptions,
    isLoadingProducts: productsQuery.isLoading,
    productsData: productsQuery.data,
    isPendingSubmission: createInvoiceMutation.isPending,

    // Actions
    updateField,
    setMoneda: (moneda: string) => {
      clearFieldError("moneda");
      setForm((prev) => ({ ...prev, moneda }));
    },
    setTasaCambio: (tasaCambio: string) => {
      clearFieldError("tasaCambio");
      setForm((prev) => ({ ...prev, tasaCambio }));
    },
    handleAddItem,
    updateItemField,
    handleRemoveItem,
    handleSubmit,
    handleProductCreated,
    setIsCreateProductOpen,
    setSelectedProductId,
    setItemCantidad,
    setItemDescuento,
    setInputText,
  };
};
