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
                axiosClient.get("/facturas"),
                axiosClient.get("/productos"),
            ]);

            const facturasRaw = facturasRes.data.facturas || [];
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

            // Calculate Stats
            const totalInvoices = invoices.length;
            const totalProducts = productosRaw.length;
            const totalSpent = invoices.reduce((acc, curr) => acc + curr.total, 0);

            // Filter logic (Client-side for now)
            const now = new Date();
            let currentPeriodInvoices = 0;

            const filteredInvoices = invoices.filter(inv => {
                if (!inv.rawDate) return false;
                const invoiceDate = inv.rawDate;

                if (filter === 'day') {
                    return invoiceDate.toDateString() === now.toDateString();
                } else if (filter === 'month') {
                    return invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
                } else if (filter === 'year') {
                    return invoiceDate.getFullYear() === now.getFullYear();
                }
                // 'week' logic is a bit more complex, fallback to month or implement if needed
                return invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
            });

            currentPeriodInvoices = filteredInvoices.length;

            // Chart Data (Group by Month)
            const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const chartMap = new Map<number, number>(); // monthIndex -> total

            // Initialize last 6 months
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                chartMap.set(d.getMonth(), 0);
            }

            invoices.forEach(inv => {
                if (inv.rawDate) {
                    const m = inv.rawDate.getMonth();
                    if (chartMap.has(m)) {
                        chartMap.set(m, (chartMap.get(m) || 0) + inv.total);
                    }
                }
            });

            const processedChartData: ExpenseData[] = Array.from(chartMap.entries()).map(([monthIndex, value]) => ({
                name: monthNames[monthIndex],
                value
            })).sort((a, b) => {
                // This sort might be tricky with year wrapping, but for simple "last 6 months" generated logically above, 
                // we can just map the pre-generated keys in order if we cared about order. 
                // For now, let's keep it simple.
                return 0;
            });
            // Re-sort chart data based on the key generation order to rely on map insertion order or strict logic if needed
            // Actually, standard map iteration follows insertion order.

            setStats({
                totalInvoices,
                totalProducts,
                totalSpent,
                currentPeriodInvoices,
                spendingTrend: 0, // Need historical data for real trend
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
