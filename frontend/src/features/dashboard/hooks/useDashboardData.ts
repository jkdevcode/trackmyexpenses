import { useState, useEffect } from "react";
import axiosClient from "@/lib/axiosClient";
import { addToast } from "@heroui/toast";

export type DateFilterType = "day" | "week" | "month" | "year";

export interface DashboardStats {
    totalInvoices: number;
    totalProducts: number;
    totalSpent: number;
    currentPeriodInvoices: number;
    spendingTrend: number; // Percentage change
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
    rawDate?: Date; // For filtering
}

export const useDashboardData = () => {
    const [filter, setFilter] = useState<DateFilterType>("month");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<ExpenseData[]>([]);
    const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [facturasRes, productosRes] = await Promise.all([
                axiosClient.get(`/facturas?period=${filter}`),
                axiosClient.get("/productos"),
            ]);

            const facturasRaw = facturasRes.data.facturas || [];
            const apiStats = facturasRes.data.stats || {};
            const productosRaw = productosRes.data.productos || [];

            // Process Invoices
            const invoices: Invoice[] = facturasRaw.map((f: any) => ({
                id: f.id.toString(),
                date: f.fechaHoraCompra,
                provider: f.lugarCompra || "Desconocido",
                total: parseFloat(f.totalPagar),
                itemCount: 0, // Backend doesn't return this yet in list view
                status: "processed", // Default status
                rawDate: new Date(f.fechaHoraCompra),
            }));

            // Sort by date desc
            invoices.sort((a, b) => (b.rawDate?.getTime() || 0) - (a.rawDate?.getTime() || 0));

            // Populate Stats from Backend
            // We use backend provided stats for period info and totals, but we still need totalProducts from products response
            setStats({
                totalInvoices: apiStats.totalInvoices || 0,
                totalProducts: productosRaw.length,
                totalSpent: apiStats.totalSpending || 0,
                currentPeriodInvoices: apiStats.currentPeriodInvoices || 0,
                spendingTrend: apiStats.spendingTrend || 0,
            });

            // Chart Data (Group by Month) - NOTE: This will now only show data available in the current filtered view
            // If the user wants "Trend for last 6 months" INDEPENDENT of filter, we'd need a separate endpoint or request.
            // For now, consistent behavior is that everything filters.

            const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const chartMap = new Map<number, number>(); // monthIndex -> total
            const countMap = new Map<number, number>(); // monthIndex -> count

            // If filter is 'year' or default, showing months makes sense.
            // If filter is 'day', this chart might look empty. 
            // We'll keep the logic generic for now based on returned data.

            // Initialize last 6 months (optional: if filtered by year, maybe show all months of year? Keeping existing logic for now)
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                chartMap.set(d.getMonth(), 0);
                countMap.set(d.getMonth(), 0);
            }

            invoices.forEach(inv => {
                if (inv.rawDate) {
                    const m = inv.rawDate.getMonth();
                    if (chartMap.has(m)) {
                        chartMap.set(m, (chartMap.get(m) || 0) + inv.total);
                        countMap.set(m, (countMap.get(m) || 0) + 1);
                    }
                }
            });

            const processedChartData: ExpenseData[] = Array.from(chartMap.entries()).map(([monthIndex, value]) => ({
                name: monthNames[monthIndex],
                value,
                average: (countMap.get(monthIndex) || 0) > 0 ? value / countMap.get(monthIndex)! : 0
            })).sort(() => {
                // Keep insertion order (chronological for last 6 months generated)
                return 0;
            });


            setChartData(processedChartData);
            setRecentInvoices(invoices.slice(0, 5));

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            addToast({
                title: "Error",
                description: "No se pudieron cargar los datos del dashboard",
                color: "danger",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    return {
        filter,
        setFilter,
        loading,
        stats,
        chartData,
        recentInvoices,
    };
};
