import type { InvoiceDateRangeValue } from "../../invoices/hooks/useInvoiceFilters";
import type { InvoiceFilter, InvoicePeriod } from "../../invoices/types";

import { PeriodFilter } from "@/components/filters/PeriodFilter";

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
  return (
    <PeriodFilter
      dateRangeValue={dateRangeValue}
      showBackdrop={true}
      translationNamespace="dashboard"
      value={filter.period}
      onChange={onPeriodChange}
      onDateRangeChange={onDateRangeChange}
    />
  );
};
