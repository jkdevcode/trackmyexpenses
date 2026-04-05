import type { InvoiceDateRangeValue } from "../../hooks/useInvoiceFilters";
import type { InvoiceFilter, InvoicePeriod } from "../../types";

import { PeriodFilter } from "@/components/filters/PeriodFilter";

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
  return (
    <PeriodFilter
      dateRangeValue={dateRangeValue}
      translationNamespace="invoices"
      value={filter.period}
      onChange={onPeriodChange}
      onDateRangeChange={onDateRangeChange}
    />
  );
};
