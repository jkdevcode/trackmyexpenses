import type { DateRange as PickerDateRange } from "@react-types/datepicker";
import type { DateRange, InvoiceFilter, InvoicePeriod } from "../types";

import { useMemo, useState } from "react";
import { parseDate } from "@internationalized/date";

import {
  getDefaultInvoiceDateRange,
  isValidDateInputValue,
  normalizeInvoiceFilter,
} from "../utils/invoice-filters";

export type InvoiceDateRangeValue = PickerDateRange | null;

const toPickerDate = (value?: string): PickerDateRange["start"] | null => {
  if (!isValidDateInputValue(value)) {
    return null;
  }

  try {
    return parseDate(value);
  } catch {
    return null;
  }
};

export const useInvoiceFilters = (
  initialFilter: InvoiceFilter = { period: "month" },
) => {
  const [filter, setFilter] = useState<InvoiceFilter>(() =>
    normalizeInvoiceFilter(initialFilter),
  );

  const dateRangeValue = useMemo<InvoiceDateRangeValue>(() => {
    if (filter.period !== "custom") {
      return null;
    }

    const start = toPickerDate(filter.startDate);
    const end = toPickerDate(filter.endDate);

    if (!start || !end) {
      return null;
    }

    return { start, end };
  }, [filter.endDate, filter.period, filter.startDate]);

  const setPeriod = (period: InvoicePeriod) => {
    setFilter((currentFilter) => {
      if (period !== "custom") {
        return { period };
      }

      if (currentFilter.period === "custom") {
        return normalizeInvoiceFilter(currentFilter);
      }

      return {
        period: "custom",
        ...getDefaultInvoiceDateRange(),
      };
    });
  };

  const setDateRange = (range: DateRange | null) => {
    if (!range) {
      setFilter({
        period: "custom",
        ...getDefaultInvoiceDateRange(),
      });

      return;
    }

    setFilter(
      normalizeInvoiceFilter({
        period: "custom",
        startDate: range.startDate,
        endDate: range.endDate,
      }),
    );
  };

  const setDateRangeValue = (value: InvoiceDateRangeValue) => {
    if (!value) {
      setDateRange(null);

      return;
    }

    setDateRange({
      startDate: value.start.toString(),
      endDate: value.end.toString(),
    });
  };

  return {
    filter,
    dateRangeValue,
    setDateRange,
    setDateRangeValue,
    setFilter,
    setPeriod,
  };
};
