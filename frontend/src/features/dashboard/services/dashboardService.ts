import axiosClient from "@/lib/axiosClient";

import type {
  DashboardStats,
  DateFilterType,
  ExpenseData,
  Invoice,
} from "../types";

interface DashboardViewModel {
  stats: DashboardStats;
  chartData: ExpenseData[];
  recentInvoices: Invoice[];
}

export const getDashboardData = async (
  filter: DateFilterType,
): Promise<DashboardViewModel> => {
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

  invoices.sort(
    (a, b) => (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0),
  );

  const stats: DashboardStats = {
    totalInvoices: apiStats.totalInvoices || 0,
    totalProducts: productosRaw.length,
    totalSpent: apiStats.totalSpending || 0,
    currentPeriodInvoices: apiStats.currentPeriodInvoices || 0,
    spendingTrend: apiStats.spendingTrend || 0,
  };

  const monthNames = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
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

  const chartData: ExpenseData[] = Array.from(chartMap.entries()).map(
    ([monthIndex, value]) => ({
      name: monthNames[monthIndex],
      value,
      average:
        (countMap.get(monthIndex) || 0) > 0
          ? value / (countMap.get(monthIndex) || 1)
          : 0,
    }),
  );

  return {
    stats,
    chartData,
    recentInvoices: invoices.slice(0, 5),
  };
};
