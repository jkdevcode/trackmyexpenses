import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import axiosClient from "@/lib/axiosClient";

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const storageToken = window.localStorage.getItem("token");

  if (storageToken) return storageToken;

  const cookieMatch = document.cookie.match(/(?:^|; )token=([^;]*)/);

  return cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
};

export const useReport = () => {
  const { t } = useTranslation("reports");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const downloadReport = useCallback(
    async (period: string, startDate?: string, endDate?: string) => {
      const apiUrl = import.meta.env.VITE_API_URL;

      setLoading(true);
      setError(null);
      setInfo(null);

      try {
        const url = new URL(`${apiUrl}/reportes/facturas`);

        url.searchParams.set("period", period);
        if (startDate) url.searchParams.set("startDate", startDate);
        if (endDate) url.searchParams.set("endDate", endDate);

        const token = getAuthToken();
        const response = await axiosClient.get(url.toString(), {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const blob = response.data as { size?: number };

        if ((blob.size ?? 0) === 0) {
          setInfo(t("reports:info.no_data"));
        }

        const objectUrl = window.URL.createObjectURL(
          response.data as unknown as any,
        );
        const link = document.createElement("a");

        link.href = objectUrl;
        const dateLabel = startDate && endDate ? `${startDate}_a_${endDate}` : period;
        link.download = `reporte-${dateLabel}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(objectUrl);
      } catch {
        setError(t("reports:errors.generation_failed"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  return {
    downloadReport,
    loading,
    error,
    info,
  };
};

export const useCheckReportData = (
  period: string,
  startDate?: string,
  endDate?: string,
) => {
  return useQuery({
    queryKey: ["report-check", period, startDate, endDate],
    queryFn: async () => {
      if (!period) return { hasData: false, count: 0 };
      const params = new URLSearchParams({ period });

      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const response = await axiosClient.get(
        `/reportes/facturas/check?${params.toString()}`,
      );

      return response.data as { hasData: boolean; count: number };
    },
    enabled: Boolean(period),
  });
};
