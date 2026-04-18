import { useQuery } from "@tanstack/react-query";

type ExchangeRateApiResponse = {
  rates?: Record<string, number>;
};

interface UseInvoiceExchangeRateParams {
  baseCurrency: string;
  invoiceCurrency: string;
  enabled: boolean;
}

export const useInvoiceExchangeRate = ({
  baseCurrency,
  invoiceCurrency,
  enabled,
}: UseInvoiceExchangeRateParams) =>
  useQuery<number | undefined>({
    queryKey: ["invoice-exchange-rate", baseCurrency, invoiceCurrency],
    queryFn: async () => {
      const response = await window.fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rates");
      }

      const data = (await response.json()) as ExchangeRateApiResponse;
      const apiRate = Number(data.rates?.[invoiceCurrency]);

      if (!Number.isFinite(apiRate) || apiRate <= 0) {
        return undefined;
      }

      // Backend expects base-per-invoice rate, so invert the provider rate.
      return 1 / apiRate;
    },
    enabled,
    staleTime: 1000 * 60 * 30,
  });
