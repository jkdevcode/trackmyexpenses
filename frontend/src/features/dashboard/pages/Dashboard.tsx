import { LazyMotion, domAnimation, m } from "framer-motion";
import { useTranslation } from "react-i18next";

import { DateFilter } from "../components/DateFilter";
import { StatsCards } from "../components/StatsCards";
import { RevenueChart } from "../components/RevenueChart";
import { InvoicesTable } from "../components/InvoicesTable";
import { AverageTicketChart } from "../components/AverageTicketChart";
import { useDashboardData } from "../hooks/useDashboardData";
import { usePageMeta } from "@/hooks/usePageMeta";

const Dashboard = () => {
  const { t } = useTranslation("dashboard");
  const { t: tMeta } = useTranslation("meta");
  const { filter, setFilter, stats, chartData, recentInvoices, loading } =
    useDashboardData();

  usePageMeta({
    title: tMeta("dashboard.title"),
    description: tMeta("dashboard.description")
  });

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
        <StatsCards loading={loading} stats={stats} />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Chart Section - Takes 2 cols on large screens */}
        <LazyMotion features={domAnimation}>
          <m.section
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.2 }}
          >
            <RevenueChart data={chartData} loading={loading} />
          </m.section>

          {/* Recent Invoices Table - Takes 1 col on large screens */}
          <m.section
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-1 bg-content1 rounded-2xl shadow-sm border border-default-100 p-6"
            initial={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.3 }}
          >
            <InvoicesTable invoices={recentInvoices} loading={loading} />
          </m.section>

          {/* Average Ticket Chart - Full Width Bottom */}
          <m.section
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
          >
            <AverageTicketChart data={chartData} loading={loading} />
          </m.section>
        </LazyMotion>
      </div>
    </div>
  );
};

export default Dashboard;
