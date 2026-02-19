import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";
import { addToast } from "@heroui/toast";

export type DateFilterType = "day" | "week" | "month" | "year";

export interface DashboardStats {
  totalInvoices: number;
  totalProducts: number;
  totalSpent: number;
  currentPeriodInvoices: number;
  spendingTrend: number;
}

export interface ExpenseData {
  name: string;
  value: number;
  average?: number;
}

export interface Invoice {
  id: string;
  date: string;
  provider: string;
  total: number;
  itemCount: number;
  status: "processed" | "pending" | "error";
  rawDate?: Date;
}

interface DashboardViewModel {
  stats: DashboardStats;
  chartData: ExpenseData[];
  recentInvoices: Invoice[];
}

const getDashboardData = async (filter: DateFilterType): Promise<DashboardViewModel> => {
  const [facturasRes, productosRes] = await Promise.all([
    axiosClient.get(`/facturas?period=${filter}`),
    axiosClient.get("/productos"),
  ]);

  const facturasRaw = facturasRes.data.facturas || [];
  const apiStats = facturasRes.data.stats || {};
  const productosRaw = productosRes.data.productos || [];

  const invoices: Invoice[] = facturasRaw.map((f: any) => ({
    id: f.id.toString(),
    date: f.fechaHoraCompra,
    provider: f.lugarCompra || "Desconocido",
    total: parseFloat(f.totalPagar),
    itemCount: 0,
    status: "processed",
    rawDate: new Date(f.fechaHoraCompra),
  }));

  invoices.sort((a, b) => (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0));

  const stats: DashboardStats = {
    totalInvoices: apiStats.totalInvoices || 0,
    totalProducts: productosRaw.length,
    totalSpent: apiStats.totalSpending || 0,
    currentPeriodInvoices: apiStats.currentPeriodInvoices || 0,
    spendingTrend: apiStats.spendingTrend || 0,
  };

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const chartMap = new Map<number, number>();
  const countMap = new Map<number, number>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    chartMap.set(d.getMonth(), 0);
    countMap.set(d.getMonth(), 0);
  }

  invoices.forEach((inv) => {
    if (!inv.rawDate) return;

    const month = inv.rawDate.getMonth();
    if (!chartMap.has(month)) return;

    chartMap.set(month, (chartMap.get(month) || 0) + inv.total);
    countMap.set(month, (countMap.get(month) || 0) + 1);
  });

  const chartData: ExpenseData[] = Array.from(chartMap.entries()).map(([monthIndex, value]) => ({
    name: monthNames[monthIndex],
    value,
    average: (countMap.get(monthIndex) || 0) > 0 ? value / (countMap.get(monthIndex) || 1) : 0,
  }));

  return {
    stats,
    chartData,
    recentInvoices: invoices.slice(0, 5),
  };
};

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
