import type { DateFilterType } from "../types";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { addToast } from "@heroui/toast";

import { getDashboardData } from "../services/dashboardService";

export const useDashboardData = () => {
  const { t } = useTranslation(["dashboard", "common"]);
  const [filter, setFilter] = useState<DateFilterType>("month");

  const query = useQuery({
    queryKey: ["dashboard", filter],
    queryFn: () => getDashboardData(filter),
  });

  useEffect(() => {
    if (!query.error) return;

    addToast({
      title: t("common:error"),
      description: t("dashboard:errors.load_failed"),
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
    filter,
    setFilter,
    loading: query.isPending,
    stats: data.stats,
    chartData: data.chartData,
    recentInvoices: data.recentInvoices,
  };
};
