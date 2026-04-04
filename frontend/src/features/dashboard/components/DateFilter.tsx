import type { InvoiceDateRangeValue } from "../../invoices/hooks/useInvoiceFilters";
import type { InvoiceFilter, InvoicePeriod } from "../../invoices/types";

import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

import { InvoiceDateRangePicker } from "../../invoices/components/InvoiceDateRangePicker";

import { useColorTheme } from "@/hooks/use-color-theme";

interface DateFilterProps {
  dateRangeValue: InvoiceDateRangeValue;
  filter: InvoiceFilter;
  onDateRangeChange: (value: InvoiceDateRangeValue) => void;
  onPeriodChange: (filter: InvoicePeriod) => void;
}

export const DateFilter = ({
  dateRangeValue,
  filter,
  onDateRangeChange,
  onPeriodChange,
}: DateFilterProps) => {
  const { t } = useTranslation("dashboard");
  const { appColor } = useColorTheme();

  const filters: InvoicePeriod[] = ["day", "week", "month", "year", "custom"];

  return (
    <div className="flex flex-col items-stretch gap-3">
      <div className="flex items-center gap-2 bg-content2/50 p-1 rounded-lg w-fit">
        {filters.map((currentFilter) => (
          <Button
            key={currentFilter}
            className={`capitalize font-medium ${filter.period === currentFilter ? "shadow-md" : "text-default-500 hover:text-default-900"}`}
            color={filter.period === currentFilter ? appColor : "default"}
            size="sm"
            variant={filter.period === currentFilter ? "solid" : "light"}
            onPress={() => onPeriodChange(currentFilter)}
          >
            {t(`filters.${currentFilter}`)}
          </Button>
        ))}
      </div>

      {filter.period === "custom" ? (
        <InvoiceDateRangePicker
          ariaLabel={t("filters.custom_range")}
          className="w-full sm:w-80"
          label={t("filters.custom_range")}
          value={dateRangeValue}
          onChange={onDateRangeChange}
        />
      ) : null}
    </div>
  );
};
