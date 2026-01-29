import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { DateFilter } from "../components/DateFilter";
import { StatsCards } from "../components/StatsCards";
import { RevenueChart } from "../components/RevenueChart";
import { InvoicesTable } from "../components/InvoicesTable";
import { useDashboardData } from "../hooks/useDashboardData";

const Dashboard = () => {
    const { t } = useTranslation("dashboard");
    const { filter, setFilter, stats, chartData, recentInvoices, loading } = useDashboardData();

    return (
        <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-default-500">{t("subtitle")}</p>
                </div>
                <DateFilter filter={filter} onChange={setFilter} />
            </div>

            {/* Stats Section */}
            <section>
                <StatsCards stats={stats} loading={loading} />
            </section>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Section - Takes 2 cols on large screens */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-1"
                >
                    <RevenueChart data={chartData} loading={loading} />
                </motion.section>

                {/* Recent Invoices Table - Takes 1 col on large screens */}
                <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-1 bg-content1 rounded-2xl shadow-sm border border-default-100 p-6"
                >
                    <InvoicesTable invoices={recentInvoices} loading={loading} />
                </motion.section>
            </div>
        </div>
    );
};

export default Dashboard;
