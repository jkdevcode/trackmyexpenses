import type { ParsedInvoice, ProductSuggestion } from "../types";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import {
  parseDate,
  getLocalTimeZone,
  today,
  type DateValue,
} from "@internationalized/date";
import { useTranslation } from "react-i18next";

import { InvoiceSummary } from "./InvoiceSummary";
import { InvoiceItemsModal } from "./InvoiceItemsModal";

import { appColor } from "@/theme/theme.config";
import { getInvoiceSchema } from "@/schemas/invoice";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  normalizeCurrencyCode,
} from "@/constants/currency";
import { useSession } from "@/contexts/session-context";
import { formatCurrency } from "../utils/formatters";

interface InvoiceFormProps {
  initialData: ParsedInvoice;
  onSave: (
    data: InvoiceFormValues & { totalPagar: number; tasaCambio?: number },
    products: ProductSuggestion[],
  ) => void;
  onCancel: () => void;
  saving: boolean;
}

export interface InvoiceFormValues {
  lugarCompra: string;
  nitProveedor: string;
  fechaHoraCompra: string;
  metodoPago: string;
  moneda: string;
}

const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const InvoiceForm = ({
  initialData,
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
    initialData.monedaDetectada,
    baseCurrency,
  );

  const [products, setProducts] = useState<ProductSuggestion[]>(
    initialData.productos || [],
  );
  const [tasaCambio, setTasaCambio] = useState<string>("");

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
      fechaHoraCompra:
        initialData.fecha || new Date().toISOString().split("T")[0],
      metodoPago: "EFECTIVO",
      moneda: detectedCurrency,
    },
    resolver: yupResolver(getInvoiceSchema(t)),
    mode: "onTouched",
  });

  const selectedCurrency = watch("moneda") || detectedCurrency;
  const showConversion = selectedCurrency !== baseCurrency;
  const parsedRate = Number(tasaCambio);
  const rateIsValid = Number.isFinite(parsedRate) && parsedRate > 0;
  const effectiveRate = showConversion
    ? rateIsValid
      ? parsedRate
      : null
    : 1;

  const totalBase = useMemo(() => {
    if (effectiveRate === null) return null;

    return roundCurrency(totalPagar * effectiveRate);
  }, [totalPagar, effectiveRate]);

  const submitForm = (values: InvoiceFormValues) => {
    const rateToSend =
      values.moneda === baseCurrency
        ? undefined
        : rateIsValid
          ? parsedRate
          : undefined;

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
            <Input
              isRequired
              errorMessage={errors.lugarCompra?.message}
              isInvalid={!!touchedFields.lugarCompra && !!errors.lugarCompra}
              label={t("form.provider")}
              variant="bordered"
              {...register("lugarCompra")}
            />
            <Input
              errorMessage={errors.nitProveedor?.message}
              isInvalid={!!touchedFields.nitProveedor && !!errors.nitProveedor}
              label={t("form.nit")}
              variant="bordered"
              {...register("nitProveedor")}
            />
            <Controller
              control={control}
              name="fechaHoraCompra"
              render={({ field }) => (
                <DatePicker
                  isRequired
                  errorMessage={errors.fechaHoraCompra?.message}
                  isInvalid={
                    !!touchedFields.fechaHoraCompra && !!errors.fechaHoraCompra
                  }
                  label={t("form.date")}
                  maxValue={today(getLocalTimeZone())}
                  value={
                    field.value
                      ? parseDate(field.value.split("T")[0])
                      : today(getLocalTimeZone())
                  }
                  variant="bordered"
                  onChange={(date: DateValue | null) =>
                    field.onChange(date ? date.toString() : "")
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="metodoPago"
              render={({ field }) => (
                <Select
                  isRequired
                  errorMessage={errors.metodoPago?.message}
                  isInvalid={!!touchedFields.metodoPago && !!errors.metodoPago}
                  label={t("form.payment_method")}
                  selectedKeys={[field.value]}
                  variant="bordered"
                  onChange={(e) => field.onChange(e.target.value)}
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
              )}
            />
            <Controller
              control={control}
              name="moneda"
              render={({ field }) => (
                <Select
                  isRequired
                  errorMessage={errors.moneda?.message}
                  isInvalid={!!touchedFields.moneda && !!errors.moneda}
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

          {showConversion ? (
            <Input
              color={appColor}
              description={t("form.currency.rate_hint")}
              label={t("form.currency.rate")}
              min={0.000001}
              step="0.000001"
              type="number"
              value={tasaCambio}
              variant="bordered"
              onValueChange={setTasaCambio}
            />
          ) : null}

          <div className="border-t border-default-200 pt-4 mt-2 space-y-3">
            <Input
              readOnly
              className="font-bold text-lg"
              color={appColor}
              description={t("form.total_desc")}
              label={t("form.total")}
              value={formatCurrency(totalPagar, i18n.language, selectedCurrency)}
            />

            {showConversion ? (
              <Input
                readOnly
                className="font-semibold"
                color={appColor}
                description={t("form.currency.base_desc", {
                  currency: baseCurrency,
                })}
                label={t("form.currency.total_base")}
                value={
                  totalBase === null
                    ? t("form.currency.pending")
                    : formatCurrency(totalBase, i18n.language, baseCurrency)
                }
              />
            ) : null}
          </div>
        </CardBody>
      </Card>

      <div>
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
              {products.map((p) => (
                <li
                  key={`${p.nombreDetected}-${p.cantidad}-${p.precioTotal}`}
                  className="flex justify-between text-sm border-b border-default-100 pb-1"
                >
                  <span>
                    {p.cantidad} x {p.nombreDetected}
                  </span>
                  <span>
                    {formatCurrency(
                      p.precioTotal,
                      i18n.language,
                      selectedCurrency,
                    )}
                  </span>
                </li>
              ))}
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
        products={products}
        onClose={onClose}
        onProductsChange={setProducts}
      />
    </form>
  );
};
