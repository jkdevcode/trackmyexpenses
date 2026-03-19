export const formatCurrency = (
  value: number,
  locale = "es-CO",
  currency = "COP",
) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    const fallback = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
    }).format(value);

    return `${fallback} ${currency}`;
  }
};

export const formatDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
