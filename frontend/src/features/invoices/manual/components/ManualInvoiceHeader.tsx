import type { ManualInvoiceFormState, PaymentMethod } from "../types";

import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useTranslation } from "react-i18next";

import { PAYMENT_METHOD_OPTIONS } from "../../constants/payment-methods";

import { SUPPORTED_CURRENCIES } from "@/constants/currency";

interface ManualInvoiceHeaderProps {
  form: ManualInvoiceFormState;
  fieldErrors: Map<string, string>;
  appColor: any;
  updateField: (key: keyof ManualInvoiceFormState, value: string) => void;
  setMoneda: (value: string) => void;
  setTasaCambio: (value: string) => void;
  showConversion: boolean;
}

export const ManualInvoiceHeader = ({
  form,
  fieldErrors,
  appColor,
  updateField,
  setMoneda,
  setTasaCambio,
  showConversion,
}: ManualInvoiceHeaderProps) => {
  const { t } = useTranslation(["invoices", "common"]);

  return (
    <div className="space-y-4">
      <div
        data-error-field={
          fieldErrors.has("fechaHoraCompra") ? "fechaHoraCompra" : undefined
        }
      >
        <Input
          color={appColor}
          errorMessage={fieldErrors.get("fechaHoraCompra")}
          isInvalid={fieldErrors.has("fechaHoraCompra")}
          isRequired
          label={t("manual.fecha")}
          type="date"
          value={form.fecha}
          variant="bordered"
          onValueChange={(value) => updateField("fecha", value)}
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
          isRequired
          label={t("manual.metodoPago")}
          selectedKeys={[form.metodoPago]}
          variant="bordered"
          onChange={(event) =>
            updateField("metodoPago", event.target.value as PaymentMethod)
          }
        >
          {PAYMENT_METHOD_OPTIONS.map((option) => (
            <SelectItem key={option.key}>
              {t(option.labelKey, option.fallback)}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div data-error-field={fieldErrors.has("moneda") ? "moneda" : undefined}>
        <Select
          color={appColor}
          errorMessage={fieldErrors.get("moneda")}
          isInvalid={fieldErrors.has("moneda")}
          isRequired
          label={t("manual.currency.label")}
          placeholder={t("manual.currency.placeholder")}
          selectedKeys={form.moneda ? [form.moneda] : []}
          variant="bordered"
          onChange={(event) => setMoneda(event.target.value)}
        >
          {SUPPORTED_CURRENCIES.map((code) => (
            <SelectItem key={code}>
              {t(`common:currency.options.${code}`, code)}
            </SelectItem>
          ))}
        </Select>
      </div>

      {showConversion ? (
        <div
          data-error-field={
            fieldErrors.has("tasaCambio") ? "tasaCambio" : undefined
          }
        >
          <Input
            color={appColor}
            description={t("manual.currency.rate_hint")}
            errorMessage={fieldErrors.get("tasaCambio")}
            isInvalid={fieldErrors.has("tasaCambio")}
            label={t("manual.currency.rate")}
            min={0.000001}
            step="0.000001"
            type="number"
            value={form.tasaCambio}
            variant="bordered"
            onValueChange={setTasaCambio}
          />
        </div>
      ) : null}

      <div
        data-error-field={
          fieldErrors.has("lugarCompra") ? "lugarCompra" : undefined
        }
      >
        <Input
          color={appColor}
          errorMessage={fieldErrors.get("lugarCompra")}
          isInvalid={fieldErrors.has("lugarCompra")}
          isRequired
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
    </div>
  );
};
