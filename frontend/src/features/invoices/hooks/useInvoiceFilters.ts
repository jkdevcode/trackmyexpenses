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
type StoredInvoiceDateRange = DateRange | null;

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

const normalizeStoredDateRange = (
  range?: Partial<DateRange> | null,
): DateRange => {
  const normalized = normalizeInvoiceFilter({
    period: "custom",
    startDate: range?.startDate,
    endDate: range?.endDate,
  });

  return {
    startDate: normalized.startDate ?? getDefaultInvoiceDateRange().startDate,
    endDate: normalized.endDate ?? getDefaultInvoiceDateRange().endDate,
  };
};

const getStoredDateRange = (filter: InvoiceFilter): StoredInvoiceDateRange => {
  if (filter.period !== "custom") {
    return null;
  }

  return normalizeStoredDateRange({
    startDate: filter.startDate,
    endDate: filter.endDate,
  });
};

export const useInvoiceFilters = (
  initialFilter: InvoiceFilter = { period: "month" },
) => {
  const normalizedInitialFilter = normalizeInvoiceFilter(initialFilter);
  const [filter, setFilterState] = useState<InvoiceFilter>(
    normalizedInitialFilter,
  );
  const [lastCustomRange, setLastCustomRange] =
    useState<StoredInvoiceDateRange>(() =>
      getStoredDateRange(normalizedInitialFilter),
    );

  const dateRangeValue = useMemo<InvoiceDateRangeValue>(() => {
    const storedRange = lastCustomRange ?? getDefaultInvoiceDateRange();
    const start = toPickerDate(storedRange.startDate);
    const end = toPickerDate(storedRange.endDate);

    if (!start || !end) {
      return null;
    }

    return { start, end };
  }, [lastCustomRange]);

  const setFilter = (nextFilter: InvoiceFilter) => {
    const normalizedFilter = normalizeInvoiceFilter(nextFilter);

    setFilterState(normalizedFilter);

    if (normalizedFilter.period === "custom") {
      setLastCustomRange(
        normalizeStoredDateRange({
          startDate: normalizedFilter.startDate,
          endDate: normalizedFilter.endDate,
        }),
      );
    }
  };

  const setPeriod = (period: InvoicePeriod) => {
    if (period !== "custom") {
      setFilter({ period });

      return;
    }

    const restoredRange =
      filter.period === "custom"
        ? normalizeStoredDateRange({
            startDate: filter.startDate,
            endDate: filter.endDate,
          })
        : normalizeStoredDateRange(lastCustomRange);

    setFilter({
      period: "custom",
      ...restoredRange,
    });
  };

  const setDateRange = (range: DateRange | null) => {
    if (!range) {
      setLastCustomRange(null);

      if (filter.period === "custom") {
        setFilterState({ period: "month" });
      }

      return;
    }

    const normalizedRange = normalizeStoredDateRange(range);

    setFilter({
      period: "custom",
      ...normalizedRange,
    });
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
