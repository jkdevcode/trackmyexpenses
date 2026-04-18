import type { InvoiceUnit } from "../types";

const DEFAULT_LOCALE = "es-CO";
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const padDateToken = (value: number) => String(value).padStart(2, "0");

const toFiniteNumber = (value: number | string | null | undefined) => {
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

const toUtcDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(trimmed);

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;

    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const parsed = new Date(trimmed);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toLocalDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${padDateToken(date.getMonth() + 1)}-${padDateToken(date.getDate())}`;

const toUtcDateInputValue = (date: Date) =>
  `${date.getUTCFullYear()}-${padDateToken(date.getUTCMonth() + 1)}-${padDateToken(date.getUTCDate())}`;

export const getTodayDateInputValue = () => toLocalDateInputValue(new Date());

export const toInvoiceDateInputValue = (
  value: string | Date | null | undefined,
) => {
  const date = toUtcDate(value);

  return date ? toUtcDateInputValue(date) : "";
};

export const toInvoiceUtcIsoString = (
  value: string | Date | null | undefined,
) => {
  const date = toUtcDate(value);

  return date
    ? new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
      ).toISOString()
    : "";
};

export const getInvoiceMonthIndex = (
  value: string | Date | null | undefined,
) => {
  const date = toUtcDate(value);

  return date ? date.getUTCMonth() : null;
};

export const formatNumber = (
  value: number | string | null | undefined,
  locale = DEFAULT_LOCALE,
  options: Intl.NumberFormatOptions = {},
) =>
  new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    ...options,
  }).format(toFiniteNumber(value));

export const formatPercent = (
  value: number | string | null | undefined,
  locale = DEFAULT_LOCALE,
) => `${formatNumber(value, locale, { maximumFractionDigits: 2 })}%`;

export const formatInvoiceQuantity = (
  value: number | string | null | undefined,
  unit?: InvoiceUnit | string | null,
  locale = DEFAULT_LOCALE,
) =>
  formatNumber(value, locale, {
    maximumFractionDigits: unit === "kg" ? 3 : 0,
  });

export const formatCurrency = (
  value: number | string | null | undefined,
  locale = DEFAULT_LOCALE,
  currency = "COP",
) => {
  const numericValue = toFiniteNumber(value);
  const roundedValue = Number(numericValue.toFixed(2));
  const minimumFractionDigits = Number.isInteger(roundedValue) ? 0 : 2;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    const fallback = formatNumber(numericValue, locale, {
      minimumFractionDigits,
      maximumFractionDigits: 2,
    });

    return `${fallback} ${currency}`;
  }
};

export const formatDate = (
  value: string | Date | null | undefined,
  locale: string,
) => {
  const date = toUtcDate(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};
