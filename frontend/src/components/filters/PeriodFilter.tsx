import type { InvoiceDateRangeValue } from "../../features/invoices/hooks/useInvoiceFilters";
import type { InvoicePeriod } from "../../features/invoices/types";

import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

import { CustomDatePopover } from "./CustomDatePopover";

import { useColorTheme } from "@/hooks/use-color-theme";

interface PeriodFilterProps {
  dateRangeValue: InvoiceDateRangeValue;
  value: InvoicePeriod;
  onChange: (value: InvoicePeriod) => void;
  onDateRangeChange: (value: InvoiceDateRangeValue) => void;
  translationNamespace: "dashboard" | "invoices";
  /**
   * When true, renders a full-page dark scrim behind the date popover.
   * Pass on the Dashboard to cut through chart visual noise.
   * Defaults to false.
   */
  showBackdrop?: boolean;
}

/** The static period granularity tabs — "custom" is intentionally excluded.
 *  Custom date range control lives in the separate CustomDatePopover below. */
const PERIOD_TABS: Exclude<InvoicePeriod, "custom">[] = [
  "day",
  "week",
  "month",
  "year",
];

export const PeriodFilter = ({
  dateRangeValue,
  value,
  onChange,
  onDateRangeChange,
  translationNamespace,
  showBackdrop = false,
}: PeriodFilterProps) => {
  const { t } = useTranslation(translationNamespace);
  const { appColor } = useColorTheme();

  const isCustomActive = value === "custom";

  return (
    <div className="flex flex-row flex-wrap items-center justify-between w-full gap-4">
      {/* LEFT: Period granularity tabs: Day / Week / Month / Year */}
      <div className="flex items-center gap-2 bg-content2/50 p-1 rounded-lg overflow-x-auto min-w-0">
        {PERIOD_TABS.map((period) => (
          <Button
            key={period}
            className={`capitalize font-medium whitespace-nowrap min-w-[70px] ${
              value === period
                ? "shadow-md"
                : "text-default-500 hover:text-default-900"
            }`}
            color={value === period ? appColor : "default"}
            size="sm"
            variant={value === period ? "solid" : "light"}
            onPress={() => onChange(period)}
          >
            {t(`filters.${period}`)}
          </Button>
        ))}
      </div>

      {/* RIGHT: Custom date range control — visually separate */}
      <div className="flex-shrink-0">
        <CustomDatePopover
          isCustomActive={isCustomActive}
          showBackdrop={showBackdrop}
          translationNamespace={translationNamespace}
          value={dateRangeValue}
          onChange={onDateRangeChange}
          onClearDates={() => {
            onDateRangeChange(null);
            // Revert to default period when clearing a custom range
            if (isCustomActive) {
              onChange("month");
            }
          }}
          onRequestCustom={() => onChange("custom")}
        />
      </div>
    </div>
  );
};
