export const SUPPORTED_CURRENCIES = ["COP", "USD", "EUR", "MXN"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: SupportedCurrency = "COP";

export const isSupportedCurrency = (
  value?: string | null,
): value is SupportedCurrency => {
  if (!value) return false;
  const candidate = value.trim().toUpperCase();

  return (SUPPORTED_CURRENCIES as readonly string[]).includes(candidate);
};

export const normalizeCurrencyCode = (
  value?: string | null,
  fallback: SupportedCurrency = DEFAULT_CURRENCY,
): SupportedCurrency => {
  if (!value) return fallback;

  const candidate = value.trim().toUpperCase();

  return isSupportedCurrency(candidate) ? candidate : fallback;
};
