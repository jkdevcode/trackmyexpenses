import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { addToast } from "@heroui/toast";
import { getDashboardData } from "../services/dashboardService";
import type { DateFilterType } from "../types";

export const useDashboardData = () => {
  const [filter, setFilter] = useState<DateFilterType>("month");

  const query = useQuery({
    queryKey: ["dashboard", filter],
    queryFn: () => getDashboardData(filter),
  });

  useEffect(() => {
    if (!query.error) return;

    addToast({
      title: "Error",
      description: "No se pudieron cargar los datos del dashboard",
      color: "danger",
    });
  }, [query.error]);

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
