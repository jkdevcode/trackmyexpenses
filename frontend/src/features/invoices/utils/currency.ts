import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "@/constants/currency";

export const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const resolveInvoiceCurrency = (value?: string | null) =>
  normalizeCurrencyCode(value, DEFAULT_CURRENCY);

export const getInvoiceCurrencies = (
  moneda?: string | null,
  monedaBase?: string | null,
) => {
  const currency = resolveInvoiceCurrency(moneda ?? monedaBase);
  const baseCurrency = resolveInvoiceCurrency(monedaBase ?? currency);

  return {
    currency,
    baseCurrency,
    showBase: currency !== baseCurrency,
  };
};

export const getInvoiceBaseTotal = (
  totalPagar: number,
  totalPagarBase?: number | null,
) => totalPagarBase ?? totalPagar;

export const calculateInvoiceBaseTotal = (
  total: number,
  tasaCambio?: number | null,
) => {
  if (!Number.isFinite(tasaCambio) || (tasaCambio ?? 0) <= 0) {
    return null;
  }

  return roundCurrency(total * (tasaCambio ?? 0));
};
