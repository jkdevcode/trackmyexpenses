import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { addToast } from "@heroui/toast";

import { getDashboardData } from "../services/dashboardService";
import { useInvoiceFilters } from "../../invoices/hooks/useInvoiceFilters";

import { getErrorMessage } from "@/utils/errors";

export const useDashboardData = () => {
  const { t } = useTranslation(["dashboard", "common"]);
  const { filter, dateRangeValue, setDateRangeValue, setPeriod } =
    useInvoiceFilters({ period: "month" });

  const query = useQuery({
    queryKey: ["dashboard", filter],
    queryFn: () => getDashboardData(filter),
  });

  useEffect(() => {
    if (!query.error) return;

    addToast({
      title: t("common:error"),
      description: getErrorMessage(query.error, t),
      color: "danger",
    });
  }, [query.error, t]);

  const data = useMemo(
    () =>
      query.data ?? {
        stats: null,
        chartData: [],
        recentInvoices: [],
      },
    [query.data],
  );

  return {
    dateRangeValue,
    filter,
    setDateRangeValue,
    setPeriod,
    loading: query.isPending,
    stats: data.stats,
    chartData: data.chartData,
    recentInvoices: data.recentInvoices,
  };
};
