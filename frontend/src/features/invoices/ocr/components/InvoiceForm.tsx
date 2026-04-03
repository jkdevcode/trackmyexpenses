import type { ParsedInvoice, ProductSuggestion } from "../../types";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";
import { DatePicker } from "@heroui/date-picker";
import {
  parseDate,
  getLocalTimeZone,
  today,
  type DateValue,
} from "@internationalized/date";
import { useTranslation } from "react-i18next";

import { PAYMENT_METHOD_OPTIONS } from "../../constants/payment-methods";
import { useInvoiceExchangeRate } from "../../hooks/useInvoiceExchangeRate";
import { formatCurrency } from "../../utils/formatters";
import { isValidInvoiceQuantity } from "../../utils/invoice-quantity";
import { InvoiceSummary } from "../../components/InvoiceSummary";
import { InvoiceItemsModal } from "../../components/InvoiceItemsModal";
import { CurrencyConversionSection } from "../../components/CurrencyConversionSection";

import { getInvoiceSchema } from "@/schemas/invoice";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  normalizeCurrencyCode,
} from "@/constants/currency";
import { useSession } from "@/contexts/session-context";
import { useColorTheme } from "@/hooks/use-color-theme";

interface InvoiceFormProps {
  initialData: ParsedInvoice;
  onSave: (
    data: InvoiceFormValues & { totalPagar: number; tasaCambio?: number },
    products: ProductSuggestion[],
  ) => void;
  onCancel: () => void;
  saving: boolean;
  errorMessage?: string;
  fieldErrors?: Map<string, string>;
  itemErrors?: Map<number, string>;
}

export interface InvoiceFormValues {
  lugarCompra: string;
  nitProveedor: string;
  fechaHoraCompra: string;
  metodoPago: string;
  moneda: string;
}

const safeParseDate = (dateString?: string | null): DateValue => {
  if (!dateString) return today(getLocalTimeZone());
  try {
    const isoStr = dateString.split("T")[0];

    // parseDate expects strictly YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) {
      return parseDate(isoStr);
    }
  } catch {
    // Ignore parse errors from DateValue
  }

  return today(getLocalTimeZone());
};

export const InvoiceForm = ({
  errorMessage = "",
  fieldErrors = new Map(),
  initialData,
  itemErrors = new Map(),
  onSave,
  onCancel,
  saving,
}: InvoiceFormProps) => {
  const { t, i18n } = useTranslation(["invoices", "common", "validation"]);
  const { user } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const baseCurrency = normalizeCurrencyCode(
    user?.monedaBase,
    DEFAULT_CURRENCY,
  );
  const detectedCurrency = normalizeCurrencyCode(
    initialData.moneda ?? initialData.monedaDetectada,
    baseCurrency,
  );
  const { appColor } = useColorTheme();

  const [products, setProducts] = useState<ProductSuggestion[]>(
    initialData.productos || [],
  );
  const [tasaCambio, setTasaCambio] = useState<number | undefined>(() => {
    const rate = Number(initialData.tasaCambio);

    return Number.isFinite(rate) && rate > 0 ? rate : undefined;
  });

  const totalPagar = useMemo(() => {
    return products.reduce((acc, curr) => acc + (curr.precioTotal || 0), 0);
  }, [products]);

  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors, touchedFields },
  } = useForm<InvoiceFormValues>({
    defaultValues: {
      lugarCompra: initialData.empresa?.nombre || "",
      nitProveedor: initialData.empresa?.nit || "",
      fechaHoraCompra: safeParseDate(initialData.fecha).toString(),
      metodoPago: "EFECTIVO",
      moneda: detectedCurrency,
    },
    resolver: yupResolver(getInvoiceSchema(t)),
    mode: "onTouched",
  });

  const selectedCurrency = watch("moneda") || detectedCurrency;
  const showConversion = selectedCurrency !== baseCurrency;
  const rateIsValid = Number.isFinite(tasaCambio) && (tasaCambio ?? 0) > 0;

  const exchangeRateQuery = useInvoiceExchangeRate({
    baseCurrency,
    invoiceCurrency: selectedCurrency,
    enabled: showConversion && !rateIsValid,
  });

  useEffect(() => {
    if (!showConversion || rateIsValid) return;
    const normalizedRate = exchangeRateQuery.data;

    if (
      normalizedRate !== undefined &&
      Number.isFinite(normalizedRate) &&
      normalizedRate > 0
    ) {
      setTasaCambio(normalizedRate);
    }
  }, [exchangeRateQuery.data, rateIsValid, showConversion]);

  useEffect(() => {
    if (itemErrors.size > 0 && products.length > 10) {
      onOpen();
    }
  }, [itemErrors, onOpen, products.length]);

  const handleRateChange = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) {
      setTasaCambio(undefined);

      return;
    }
    setTasaCambio(value);
  };

  const submitForm = (values: InvoiceFormValues) => {
    if (showConversion && !rateIsValid) {
      addToast({
        title: t("toast.error"),
        description: t("form.currency.rate_required"),
        color: "danger",
      });

      return;
    }

    if (
      products.some(
        (product) => !isValidInvoiceQuantity(product.cantidad, product.unidad),
      )
    ) {
      addToast({
        title: t("toast.error"),
        description: t("manual.validation.cantidad_invalid"),
        color: "danger",
      });
      onOpen();

      return;
    }

    const rateToSend = values.moneda === baseCurrency ? undefined : tasaCambio;

    onSave({ ...values, totalPagar, tasaCambio: rateToSend }, products);
  };

  return (
    <form
      className="space-y-6 max-w-4xl mx-auto"
      onSubmit={handleSubmit(submitForm)}
    >
      <Card>
        <CardHeader className="flex flex-col items-start gap-1 pb-0">
          <h2 className="text-xl font-bold">{t("form.title")}</h2>
          <p className="text-sm text-default-500">{t("form.subtitle")}</p>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              data-error-field={
                fieldErrors.has("lugarCompra") ? "lugarCompra" : undefined
              }
            >
              <Input
                isRequired
                errorMessage={
                  fieldErrors.get("lugarCompra") ?? errors.lugarCompra?.message
                }
                isInvalid={
                  fieldErrors.has("lugarCompra") ||
                  (!!touchedFields.lugarCompra && !!errors.lugarCompra)
                }
                label={t("form.provider")}
                variant="bordered"
                {...register("lugarCompra")}
              />
            </div>
            <div
              data-error-field={
                fieldErrors.has("nitProveedor") ? "nitProveedor" : undefined
              }
            >
              <Input
                errorMessage={
                  fieldErrors.get("nitProveedor") ??
                  errors.nitProveedor?.message
                }
                isInvalid={
                  fieldErrors.has("nitProveedor") ||
                  (!!touchedFields.nitProveedor && !!errors.nitProveedor)
                }
                label={t("form.nit")}
                variant="bordered"
                {...register("nitProveedor")}
              />
            </div>
            <div
              data-error-field={
                fieldErrors.has("fechaHoraCompra")
                  ? "fechaHoraCompra"
                  : undefined
              }
            >
              <Controller
                control={control}
                name="fechaHoraCompra"
                render={({ field }) => (
                  <DatePicker
                    isRequired
                    errorMessage={
                      fieldErrors.get("fechaHoraCompra") ??
                      errors.fechaHoraCompra?.message
                    }
                    isInvalid={
                      fieldErrors.has("fechaHoraCompra") ||
                      (!!touchedFields.fechaHoraCompra &&
                        !!errors.fechaHoraCompra)
                    }
                    label={t("form.date")}
                    maxValue={today(getLocalTimeZone())}
                    value={safeParseDate(field.value)}
                    variant="bordered"
                    onChange={(date: DateValue | null) =>
                      field.onChange(date ? date.toString() : "")
                    }
                  />
                )}
              />
            </div>
            <div
              data-error-field={
                fieldErrors.has("metodoPago") ? "metodoPago" : undefined
              }
            >
              <Controller
                control={control}
                name="metodoPago"
                render={({ field }) => (
                  <Select
                    isRequired
                    errorMessage={
                      fieldErrors.get("metodoPago") ??
                      errors.metodoPago?.message
                    }
                    isInvalid={
                      fieldErrors.has("metodoPago") ||
                      (!!touchedFields.metodoPago && !!errors.metodoPago)
                    }
                    label={t("form.payment_method")}
                    selectedKeys={[field.value]}
                    variant="bordered"
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option.key}>
                        {t(option.labelKey, option.fallback)}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
            <div
              data-error-field={
                fieldErrors.has("moneda") ? "moneda" : undefined
              }
            >
              <Controller
                control={control}
                name="moneda"
                render={({ field }) => (
                  <Select
                    isRequired
                    errorMessage={
                      fieldErrors.get("moneda") ?? errors.moneda?.message
                    }
                    isInvalid={
                      fieldErrors.has("moneda") ||
                      (!!touchedFields.moneda && !!errors.moneda)
                    }
                    label={t("form.currency.label")}
                    placeholder={t("form.currency.placeholder")}
                    selectedKeys={field.value ? [field.value] : []}
                    variant="bordered"
                    onChange={(e) => field.onChange(e.target.value)}
                  >
                    {SUPPORTED_CURRENCIES.map((code) => (
                      <SelectItem key={code}>
                        {t(`common:currency.options.${code}`, code)}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>
          </div>

          <p className="text-sm text-default-500">
            {initialData.monedaDetectada
              ? t("form.currency.detected", {
                  currency: normalizeCurrencyCode(
                    initialData.monedaDetectada,
                    baseCurrency,
                  ),
                })
              : t("form.currency.fallback", { currency: baseCurrency })}
          </p>

          <div
            data-error-field={
              fieldErrors.has("tasaCambio") ? "tasaCambio" : undefined
            }
          >
            <CurrencyConversionSection
              /* errorMessage={fieldErrors.get("tasaCambio")} */
              /* isInvalid={fieldErrors.has("tasaCambio")} */
              moneda={selectedCurrency}
              monedaBase={baseCurrency}
              total={totalPagar}
              tasaCambio={tasaCambio}
              onChangeTasa={handleRateChange}
            />
          </div>

          {errorMessage ? (
            <div
              className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
              data-error-field={
                fieldErrors.size === 0 && itemErrors.size === 0
                  ? "form-error"
                  : undefined
              }
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="border-t border-default-200 pt-4 mt-2 space-y-3">
            <Input
              readOnly
              className="font-bold text-lg"
              color={appColor}
              description={t("form.total_desc")}
              label={t("form.total")}
              value={formatCurrency(
                totalPagar,
                i18n.language,
                selectedCurrency,
              )}
            />
          </div>
        </CardBody>
      </Card>

      <div data-error-field={fieldErrors.has("items") ? "items" : undefined}>
        <h3 className="text-lg font-semibold mb-2 ml-1">
          {t("form.products_title")}
        </h3>

        {products.length > 10 ? (
          <InvoiceSummary
            currencyCode={selectedCurrency}
            totalAmount={totalPagar}
            totalItems={products.length}
            onViewProducts={onOpen}
          />
        ) : (
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">
                {products.length} {t("form.items")}
              </span>
              <Button size="sm" variant="flat" onPress={onOpen}>
                {t("form.edit")}
              </Button>
            </div>
            <ul className="space-y-2">
              {products.map((p, index) => {
                const rowError = itemErrors.get(index);

                return (
                  <li
                    key={`${p.nombreDetected}-${p.cantidad}-${p.precioTotal}`}
                    className={`border-b border-default-100 pb-2 text-sm ${rowError ? "rounded-medium bg-danger-50 px-3 py-2" : ""}`}
                    data-error-field={rowError ? `items[${index}]` : undefined}
                  >
                    <div className="flex justify-between gap-3">
                      <span>
                        {p.cantidad} {p.unidad} x {p.nombreDetected}
                      </span>
                      <span>
                        {formatCurrency(
                          p.precioTotal,
                          i18n.language,
                          selectedCurrency,
                        )}
                      </span>
                    </div>
                    {rowError ? (
                      <p className="mt-1 text-xs text-danger">{rowError}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>

      <div className="flex gap-4 justify-end pt-4">
        <Button color="danger" type="button" variant="flat" onPress={onCancel}>
          {t("form.cancel")}
        </Button>
        <Button color={appColor} isLoading={saving} type="submit">
          {t("form.save")}
        </Button>
      </div>

      <InvoiceItemsModal
        currencyCode={selectedCurrency}
        isOpen={isOpen}
        itemErrors={itemErrors}
        products={products}
        onClose={onClose}
        onProductsChange={setProducts}
      />
    </form>
  );
};
