import type { InvoicePeriod } from "../../types";

import { useTranslation } from "react-i18next";
import { Select, SelectItem } from "@heroui/select";

import { useColorTheme } from "@/hooks/use-color-theme";

const PERIOD_OPTIONS: Array<{ key: InvoicePeriod; labelKey: string }> = [
  { key: "day", labelKey: "filters.day" },
  { key: "week", labelKey: "filters.week" },
  { key: "month", labelKey: "filters.month" },
  { key: "year", labelKey: "filters.year" },
];

type InvoiceFiltersProps = {
  period: InvoicePeriod;
  onPeriodChange: (period: InvoicePeriod) => void;
};

export const InvoiceFilters = ({
  period,
  onPeriodChange,
}: InvoiceFiltersProps) => {
  const { t } = useTranslation("invoices");
  const { appColor } = useColorTheme();

  return (
    <Select
      aria-label={t("list.period.label")}
      className="w-full md:w-56"
      color={appColor}
      label={t("list.period.label")}
      selectedKeys={[period]}
      size="md"
      variant="bordered"
      onChange={(event) => onPeriodChange(event.target.value as InvoicePeriod)}
    >
      {PERIOD_OPTIONS.map((option) => (
        <SelectItem key={option.key}>{t(option.labelKey)}</SelectItem>
      ))}
    </Select>
  );
};
