import type { InvoiceUnit } from "../types";

export const INVOICE_UNITS: InvoiceUnit[] = ["u", "kg", "g"];
export const DEFAULT_INVOICE_UNIT: InvoiceUnit = "u";

export const normalizeInvoiceUnit = (unit?: string | null): InvoiceUnit =>
  INVOICE_UNITS.includes(unit as InvoiceUnit)
    ? (unit as InvoiceUnit)
    : DEFAULT_INVOICE_UNIT;

export const supportsDecimalQuantity = (unit?: string | null): boolean =>
  normalizeInvoiceUnit(unit) === "kg";

export const isValidInvoiceQuantity = (
  quantity: number,
  unit?: string | null,
): boolean => {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return false;
  }

  return supportsDecimalQuantity(unit) ? true : Number.isInteger(quantity);
};

export const getInvoiceQuantityStep = (unit?: string | null): string =>
  supportsDecimalQuantity(unit) ? "0.001" : "1";

export const getInvoiceQuantityMin = (unit?: string | null): number =>
  supportsDecimalQuantity(unit) ? 0.001 : 1;
