import type { DateRange, InvoiceFilter } from "../types";

import { getTodayDateInputValue } from "./formatters";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isValidDateInputValue = (value?: string | null): value is string =>
  !!value && DATE_ONLY_PATTERN.test(value);

export const getDefaultInvoiceDateRange = (): DateRange => {
  const today = getTodayDateInputValue();

  return {
    startDate: today,
    endDate: today,
  };
};

export const normalizeInvoiceFilter = (
  filter: InvoiceFilter,
): InvoiceFilter => {
  if (filter.period !== "custom") {
    return { period: filter.period };
  }

  const fallbackRange = getDefaultInvoiceDateRange();
  const startDate = isValidDateInputValue(filter.startDate)
    ? filter.startDate
    : isValidDateInputValue(filter.endDate)
      ? filter.endDate
      : fallbackRange.startDate;
  const endDate = isValidDateInputValue(filter.endDate)
    ? filter.endDate
    : startDate;

  return {
    period: "custom",
    startDate,
    endDate,
  };
};

export const buildInvoiceFilterSearchParams = (
  filter: InvoiceFilter,
): URLSearchParams => {
  const normalizedFilter = normalizeInvoiceFilter(filter);
  const params = new URLSearchParams({
    period: normalizedFilter.period,
  });

  if (normalizedFilter.period === "custom") {
    params.set("startDate", normalizedFilter.startDate ?? "");
    params.set("endDate", normalizedFilter.endDate ?? "");
  }

  return params;
};
