import type { InvoiceDateRangeValue } from "../../hooks/useInvoiceFilters";
import type { InvoiceFilter, InvoicePeriod } from "../../types";

import { useTranslation } from "react-i18next";
import { Select, SelectItem } from "@heroui/select";

import { InvoiceDateRangePicker } from "../../components/InvoiceDateRangePicker";

import { useColorTheme } from "@/hooks/use-color-theme";

const PERIOD_OPTIONS: Array<{ key: InvoicePeriod; labelKey: string }> = [
  { key: "day", labelKey: "filters.day" },
  { key: "week", labelKey: "filters.week" },
  { key: "month", labelKey: "filters.month" },
  { key: "year", labelKey: "filters.year" },
  { key: "custom", labelKey: "filters.custom" },
];

type InvoiceFiltersProps = {
  filter: InvoiceFilter;
  dateRangeValue: InvoiceDateRangeValue;
  onDateRangeChange: (value: InvoiceDateRangeValue) => void;
  onPeriodChange: (period: InvoicePeriod) => void;
};

export const InvoiceFilters = ({
  filter,
  dateRangeValue,
  onDateRangeChange,
  onPeriodChange,
}: InvoiceFiltersProps) => {
  const { t } = useTranslation("invoices");
  const { appColor } = useColorTheme();

  return (
    <div className="flex flex-col gap-3 w-full md:w-auto">
      <Select
        aria-label={t("list.period.label")}
        className="w-full md:w-56"
        color={appColor}
        label={t("list.period.label")}
        selectedKeys={[filter.period]}
        size="md"
        variant="bordered"
        onChange={(event) =>
          onPeriodChange(event.target.value as InvoicePeriod)
        }
      >
        {PERIOD_OPTIONS.map((option) => (
          <SelectItem key={option.key}>{t(option.labelKey)}</SelectItem>
        ))}
      </Select>

      {filter.period === "custom" ? (
        <InvoiceDateRangePicker
          ariaLabel={t("list.period.custom")}
          className="w-full md:w-80"
          label={t("list.period.custom")}
          value={dateRangeValue}
          onChange={onDateRangeChange}
        />
      ) : null}
    </div>
  );
};
