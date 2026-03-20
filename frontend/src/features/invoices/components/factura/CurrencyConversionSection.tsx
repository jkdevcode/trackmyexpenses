import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";

import { formatCurrency } from "../../utils/formatters";

import { appColor } from "@/theme/theme.config";
import { appColorVariants } from "@/theme/app-color-variants";

type CurrencyConversionSectionProps = {
  moneda: string;
  monedaBase: string;
  total: number;
  tasaCambio?: number;
  onChangeTasa: (value: number) => void;
};

const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const CurrencyConversionSection = ({
  moneda,
  monedaBase,
  total,
  tasaCambio,
  onChangeTasa,
}: CurrencyConversionSectionProps) => {
  const { t, i18n } = useTranslation("invoices");
  const normalizedMoneda = moneda?.trim().toUpperCase();
  const normalizedBase = monedaBase?.trim().toUpperCase();

  if (!normalizedMoneda || !normalizedBase || normalizedMoneda === normalizedBase) {
    return null;
  }

  const rateIsValid =
    Number.isFinite(tasaCambio) && (tasaCambio ?? 0) > 0;
  const totalBase = useMemo(() => {
    if (!rateIsValid) return null;
    return roundCurrency(total * (tasaCambio ?? 0));
  }, [rateIsValid, total, tasaCambio]);

  const [inputValue, setInputValue] = useState(
    rateIsValid && tasaCambio ? String(tasaCambio) : "",
  );

  useEffect(() => {
    setInputValue(rateIsValid && tasaCambio ? String(tasaCambio) : "");
  }, [rateIsValid, tasaCambio]);

  const handleRateChange = (value: string) => {
    setInputValue(value);
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      onChangeTasa(Number.NaN);
      return;
    }
    onChangeTasa(parsed);
  };

  return (
    <Card className="border border-default-200">
      <CardBody className="gap-4">
        <div
          className={`rounded-2xl border ${appColorVariants.softBorder} ${appColorVariants.softBgText} px-4 py-3`}
        >
          <p className="text-sm font-medium">
            {t("form.currency.conversion_info", {
              moneda: normalizedMoneda,
              monedaBase: normalizedBase,
            })}
          </p>
        </div>

        <Input
          color={appColor}
          description={t("form.currency.rate_hint")}
          label={t("form.currency.rate")}
          min={0.000001}
          step="0.000001"
          type="number"
          value={inputValue}
          variant="bordered"
          onValueChange={handleRateChange}
        />

        <div className="h-px w-full bg-default-200" />

        {rateIsValid && totalBase !== null ? (
          <div className="space-y-1">
            <p className="text-sm text-default-500">
              {t("form.currency.total_base")}
            </p>
            <p className={`text-lg font-semibold ${appColorVariants.textStrong}`}>
              ≈ {formatCurrency(totalBase, i18n.language, normalizedBase)}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-warning">
            <p className="text-sm font-medium">
              {t("form.currency.missing_rate")}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
