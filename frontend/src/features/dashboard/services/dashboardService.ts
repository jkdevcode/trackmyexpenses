import type { DashboardStats, ExpenseData, Invoice } from "../types";
import type { InvoiceFilter } from "../../invoices/types";

import { getInvoiceMonthIndex } from "../../invoices/utils/formatters";
import { buildInvoiceFilterSearchParams } from "../../invoices/utils/invoice-filters";

import axiosClient from "@/lib/axiosClient";

type ApiDashboardInvoiceDto = {
  id: number | string;
  fechaHoraCompra: string;
  lugarCompra?: string | null;
  totalPagar: number | string;
  moneda?: string | null;
  monedaBase?: string | null;
  totalPagarBase?: number | string | null;
};

type DashboardFacturasResponse = {
  facturas?: ApiDashboardInvoiceDto[];
  stats?: {
    totalInvoices?: number;
    totalSpending?: number;
    currentPeriodInvoices?: number;
    spendingTrend?: number;
  };
};

type DashboardProductosResponse = {
  productos?: Array<{ id: number | string }>;
};

interface DashboardViewModel {
  stats: DashboardStats;
  chartData: ExpenseData[];
  recentInvoices: Invoice[];
}

const getChartAnchorDate = (filter: InvoiceFilter): Date => {
  if (filter.period !== "custom" || !filter.endDate) {
    return new Date();
  }

  return new Date(`${filter.endDate}T00:00:00.000Z`);
};

export const getDashboardData = async (
  filter: InvoiceFilter,
): Promise<DashboardViewModel> => {
  const query = buildInvoiceFilterSearchParams(filter).toString();
  const [facturasRes, productosRes] = await Promise.all([
    axiosClient.get<DashboardFacturasResponse>(`/facturas?${query}`),
    axiosClient.get<DashboardProductosResponse>("/productos"),
  ]);

  const facturasRaw = facturasRes.data.facturas || [];
  const apiStats = facturasRes.data.stats || {};
  const productosRaw = productosRes.data.productos || [];

  const invoices: Invoice[] = facturasRaw.map((f) => ({
    id: f.id.toString(),
    date: String(f.fechaHoraCompra),
    provider: f.lugarCompra || "Desconocido",
    total: Number(f.totalPagar),
    itemCount: 0,
    status: "processed",
    moneda: f.moneda ? String(f.moneda) : null,
    monedaBase: f.monedaBase ? String(f.monedaBase) : null,
    totalPagarBase:
      f.totalPagarBase !== undefined && f.totalPagarBase !== null
        ? Number(f.totalPagarBase)
        : null,
  }));

  invoices.sort((a, b) => b.date.localeCompare(a.date));

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
  const chartAnchorDate = getChartAnchorDate(filter);

  for (let i = 5; i >= 0; i--) {
    const d = new Date(chartAnchorDate.getTime());

    d.setUTCMonth(d.getUTCMonth() - i);
    chartMap.set(d.getUTCMonth(), 0);
    countMap.set(d.getUTCMonth(), 0);
  }

  invoices.forEach((inv) => {
    const month = getInvoiceMonthIndex(inv.date);

    if (month === null) return;

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
