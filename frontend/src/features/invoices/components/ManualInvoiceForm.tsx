import type {
  CreateFacturaDto,
  ProductCatalogItem,
} from "@/features/invoices/types";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { addToast } from "@heroui/toast";
import { useQueryClient } from "@tanstack/react-query";

import {
  useCreateInvoiceMutation,
  useProductsQuery,
} from "../hooks/useInvoiceMutations";
import { calculateInvoiceItemTotal } from "../utils/invoice-item";
import { formatCurrency } from "../utils/formatters";

import { CreateProductModal } from "./CreateProductModal";

import { appColor } from "@/theme/theme.config";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  normalizeCurrencyCode,
} from "@/constants/currency";
import { useSession } from "@/contexts/session-context";

const CREATE_PRODUCT_KEY = "__create__";

type PaymentMethod =
  | "EFECTIVO"
  | "TARJETA_CREDITO"
  | "TARJETA_DEBITO"
  | "TRANSFERENCIA"
  | "OTRO";

type ManualInvoiceFormState = {
  fecha: string;
  metodoPago: PaymentMethod;
  lugarCompra: string;
  nitProveedor: string;
};

const initialState: ManualInvoiceFormState = {
  fecha: new Date().toISOString().split("T")[0],
  metodoPago: "EFECTIVO",
  lugarCompra: "",
  nitProveedor: "",
};

type ManualInvoiceItem = {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  descuento?: number;
  subtotal: number;
};

export const ManualInvoiceForm = () => {
  const { t, i18n } = useTranslation(["invoices", "common", "validation"]);
  const { user } = useSession();
  const createInvoiceMutation = useCreateInvoiceMutation();
  const productsQuery = useProductsQuery();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<ManualInvoiceFormState>(initialState);
  const [formError, setFormError] = useState<string>("");
  const [items, setItems] = useState<ManualInvoiceItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [itemCantidad, setItemCantidad] = useState<string>("1");
  const [itemDescuento, setItemDescuento] = useState<string>("");
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

  const baseCurrency = normalizeCurrencyCode(
    user?.monedaBase,
    DEFAULT_CURRENCY,
  );
  const [moneda, setMoneda] = useState<string>(baseCurrency);
  const [tasaCambio, setTasaCambio] = useState<string>("");

  const updateField = <K extends keyof ManualInvoiceFormState>(
    key: K,
    value: ManualInvoiceFormState[K],
  ) => {
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

  const totalCalculado = useMemo(
    () => items.reduce((acc, item) => acc + item.subtotal, 0),
    [items],
  );

  const showConversion = moneda !== baseCurrency;
  const parsedRate = Number(tasaCambio);
  const rateIsValid = Number.isFinite(parsedRate) && parsedRate > 0;
  const totalBase = useMemo(() => {
    if (!showConversion) return totalCalculado;
    if (!rateIsValid) return null;

    return (
      Math.round((totalCalculado * parsedRate + Number.EPSILON) * 100) / 100
    );
  }, [showConversion, rateIsValid, totalCalculado, parsedRate]);

  const productOptions = useMemo(() => {
    const options = (productsQuery.data ?? []).map((product) => ({
      key: String(product.id),
      label: `${product.nombre}${product.codigo ? ` (${product.codigo})` : ""} - ${formatCurrency(
        product.precioUnitario,
        i18n.language,
        moneda,
      )}`,
    }));

    options.push({
      key: CREATE_PRODUCT_KEY,
      label: t("manual.items.create_product"),
    });

    return options;
  }, [productsQuery.data, t, i18n.language, moneda]);

  const handleAddItem = () => {
    const productId = Number(selectedProductId);
    const cantidad = Number(itemCantidad);
    const descuento = itemDescuento === "" ? undefined : Number(itemDescuento);

    if (!productId) {
      const message = t("manual.validation.product_required");

      setFormError(message);

      return;
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      const message = t("manual.validation.cantidad_invalid");

      setFormError(message);

      return;
    }

    if (
      descuento !== undefined &&
      (!Number.isFinite(descuento) || descuento < 0 || descuento > 100)
    ) {
      const message = t("manual.validation.descuento_invalid");

      setFormError(message);

      return;
    }

    if (items.some((item) => item.productoId === productId)) {
      const message = t("manual.validation.item_duplicate");

      setFormError(message);

      return;
    }

    const selectedProduct = (productsQuery.data ?? []).find(
      (product: ProductCatalogItem) => product.id === productId,
    );

    if (!selectedProduct) {
      const message = t("manual.validation.product_not_found");

      setFormError(message);

      return;
    }

    const subtotal = calculateInvoiceItemTotal(
      selectedProduct.precioUnitario,
      cantidad,
      descuento ?? 0,
    );

    const newItem: ManualInvoiceItem = {
      productoId: selectedProduct.id,
      nombre: selectedProduct.nombre,
      precioUnitario: selectedProduct.precioUnitario,
      cantidad,
      descuento,
      subtotal,
    };

    setItems((prev) => [...prev, newItem]);
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
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

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
      moneda === baseCurrency
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
      moneda,
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
      void error;
      const message = t("manual.error");

      setFormError(message);
      addToast({
        title: t("toast.error"),
        description: message,
        color: "danger",
      });
    }
  };

  const handleProductCreated = (product: ProductCatalogItem) => {
    queryClient.setQueryData<ProductCatalogItem[]>(["productos"], (prev) => {
      const existing = prev ?? [];

      if (existing.some((item) => item.id === product.id)) {
        return existing;
      }

      return [...existing, product].sort((a, b) =>
        a.nombre.localeCompare(b.nombre),
      );
    });

    setSelectedProductId(String(product.id));
    setIsCreateProductOpen(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardBody className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            color={appColor}
            isRequired
            label={t("manual.fecha")}
            type="date"
            value={form.fecha}
            variant="bordered"
            onValueChange={(value) => updateField("fecha", value)}
          />

          <Select
            color={appColor}
            isRequired
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

          <Select
            color={appColor}
            isRequired
            label={t("manual.currency.label")}
            placeholder={t("manual.currency.placeholder")}
            selectedKeys={moneda ? [moneda] : []}
            variant="bordered"
            onChange={(event) => setMoneda(event.target.value)}
          >
            {SUPPORTED_CURRENCIES.map((code) => (
              <SelectItem key={code}>
                {t(`common:currency.options.${code}`, code)}
              </SelectItem>
            ))}
          </Select>

          {showConversion ? (
            <Input
              color={appColor}
              description={t("manual.currency.rate_hint")}
              label={t("manual.currency.rate")}
              min={0.000001}
              step="0.000001"
              type="number"
              value={tasaCambio}
              variant="bordered"
              onValueChange={setTasaCambio}
            />
          ) : null}

          <Input
            color={appColor}
            isRequired
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
            <h3 className="font-semibold">{t("manual.items.add_title")}</h3>

            <Select
              color={appColor}
              isLoading={productsQuery.isLoading}
              label={t("manual.items.producto")}
              selectedKeys={selectedProductId ? [selectedProductId] : []}
              variant="bordered"
              items={productOptions}
              onChange={(event) => {
                const value = event.target.value;

                if (value === CREATE_PRODUCT_KEY) {
                  setIsCreateProductOpen(true);
                  setSelectedProductId("");

                  return;
                }

                setSelectedProductId(value);
              }}
            >
              {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                color={appColor}
                label={t("manual.items.cantidad")}
                min={1}
                step="1"
                type="number"
                value={itemCantidad}
                variant="bordered"
                onValueChange={setItemCantidad}
              />
              <Input
                color={appColor}
                label={t("manual.items.descuento")}
                min={0}
                step="0.01"
                type="number"
                value={itemDescuento}
                variant="bordered"
                onValueChange={setItemDescuento}
              />
            </div>

            <Button color={appColor} type="button" onPress={handleAddItem}>
              {t("manual.items.add")}
            </Button>
          </div>

          <div className="space-y-3 rounded-medium border border-default-200 p-4">
            <h3 className="font-semibold">{t("manual.items.list_title")}</h3>

            {items.length === 0 ? (
              <p className="text-default-500 text-sm">
                {t("manual.items.empty")}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-default-200 text-left">
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.nombre")}
                      </th>
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.cantidad")}
                      </th>
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.precioUnitario")}
                      </th>
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.descuento")}
                      </th>
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.subtotal")}
                      </th>
                      <th className="py-2">
                        {t("manual.items.columns.acciones")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.productoId}
                        className="border-b border-default-100"
                      >
                        <td className="py-2 pr-2">{item.nombre}</td>
                        <td className="py-2 pr-2">
                          <Input
                            className="max-w-[120px]"
                            min={1}
                            size="sm"
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
                        </td>
                        <td className="py-2 pr-2">
                          {formatCurrency(
                            item.precioUnitario,
                            i18n.language,
                            moneda,
                          )}
                        </td>
                        <td className="py-2 pr-2">
                          <Input
                            className="max-w-[120px]"
                            min={0}
                            size="sm"
                            type="number"
                            value={String(item.descuento ?? 0)}
                            variant="bordered"
                            onValueChange={(value) =>
                              updateItemField(
                                item.productoId,
                                "descuento",
                                value,
                              )
                            }
                          />
                        </td>
                        <td className="py-2 pr-2">
                          {formatCurrency(item.subtotal, i18n.language, moneda)}
                        </td>
                        <td className="py-2">
                          <Button
                            color="danger"
                            size="sm"
                            type="button"
                            variant="light"
                            onPress={() => handleRemoveItem(item.productoId)}
                          >
                            {t("manual.items.remove")}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Input
                color={appColor}
                isReadOnly
                label={t("manual.total")}
                value={formatCurrency(totalCalculado, i18n.language, moneda)}
                variant="bordered"
              />
              {showConversion ? (
                <Input
                  color={appColor}
                  isReadOnly
                  label={t("manual.currency.total_base")}
                  value={
                    totalBase === null
                      ? t("manual.currency.pending")
                      : formatCurrency(totalBase, i18n.language, baseCurrency)
                  }
                  variant="bordered"
                />
              ) : null}
            </div>
          </div>

          {formError ? (
            <p className="text-danger text-sm">{formError}</p>
          ) : null}

          <Button
            color={appColor}
            isLoading={createInvoiceMutation.isPending}
            type="submit"
          >
            {t("manual.submit")}
          </Button>
        </form>
      </CardBody>

      <CreateProductModal
        isOpen={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        onCreated={handleProductCreated}
      />
    </Card>
  );
};
