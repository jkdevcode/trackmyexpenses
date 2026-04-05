import { getLocalTimeZone, startOfMonth, today } from "@internationalized/date";
import type { InvoiceDateRangeValue } from "../hooks/useInvoiceFilters";

const tz = getLocalTimeZone();

/** Compute preset ranges using @internationalized/date helpers */
export function getPresetRanges(): Record<string, InvoiceDateRangeValue> {
  const todayDate = today(tz);

  // Last 7 days: 6 days back → today
  const last7Start = todayDate.subtract({ days: 6 });

  // Last 30 days: 29 days back → today
  const last30Start = todayDate.subtract({ days: 29 });

  // Last 3 months: first day of 3 months ago → today
  const last3MonthsStart = startOfMonth(todayDate.subtract({ months: 2 }));

  // Last 6 months
  const last6MonthsStart = startOfMonth(todayDate.subtract({ months: 5 }));

  // Last 1 year
  const last1YearStart = startOfMonth(todayDate.subtract({ months: 11 }));

  return {
    today: { start: todayDate, end: todayDate },
    last_7_days: { start: last7Start, end: todayDate },
    last_30_days: { start: last30Start, end: todayDate },
    last_3_months: { start: last3MonthsStart, end: todayDate },
    last_6_months: { start: last6MonthsStart, end: todayDate },
    last_1_year: { start: last1YearStart, end: todayDate },
  };
}

/** Format a committed value into "Apr 1 – Apr 30" style */
export function formatRange(value: InvoiceDateRangeValue): string {
  if (!value) return "";
  const fmt = (d: { month: number; day: number; year: number }) =>
    new Date(d.year, d.month - 1, d.day).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  const start = fmt(value.start);
  const end = fmt(value.end);

  return start === end ? start : `${start} – ${end}`;
}

/** True if two InvoiceDateRangeValues represent the same interval */
export function rangesEqual(
  a: InvoiceDateRangeValue,
  b: InvoiceDateRangeValue,
): boolean {
  if (!a || !b) return false;

  return (
    a.start.toString() === b.start.toString() &&
    a.end.toString() === b.end.toString()
  );
}
