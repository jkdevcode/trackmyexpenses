import { Card, CardBody } from "@heroui/card";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { DashboardStats } from "../hooks/useDashboardData";
import { appColor } from "@/theme/theme.config";

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const StatsCards = ({ stats, loading }: StatsCardsProps) => {
  const { t } = useTranslation("dashboard");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const cards = [
    {
      key: "total_invoices",
      value: stats?.totalInvoices,
      label: t("stats.total_invoices"),
      icon: "📄", // Replace with actual icon component if desired
    },
    {
      key: "total_products",
      value: stats?.totalProducts,
      label: t("stats.total_products"),
      icon: "📦",
    },
    {
      key: "total_spent",
      value: stats ? formatCurrency(stats.totalSpent) : "...",
      label: t("stats.total_spent"),
      icon: "💰",
      highlight: true,
    },
    {
      key: "current_period",
      value: stats?.currentPeriodInvoices,
      label: t("stats.current_period"),
      subLabel: stats?.spendingTrend
        ? `+${stats.spendingTrend}% ${t("stats.vs_last_period")}`
        : "",
      icon: "📅",
      trend: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="h-24 w-full animate-pulse bg-default-100"
            shadow="sm"
          >
            <CardBody />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => (
        <motion.div key={card.key} variants={itemVariants}>
          <Card
            shadow="sm"
            className="h-full border border-transparent hover:border-default-200 transition-colors"
          >
            <CardBody className="gap-2 p-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-default-500 font-medium">
                    {card.label}
                  </span>
                  <span
                    className={`text-2xl font-bold ${card.highlight ? `text-${appColor}-500` : "text-foreground"}`}
                  >
                    {card.value}
                  </span>
                  {card.trend && (
                    <span className="text-xs text-success-500 font-medium bg-success-50 px-2 py-0.5 rounded-full w-fit">
                      {card.subLabel}
                    </span>
                  )}
                </div>
                <div
                  className={`p-2 rounded-lg ${card.highlight ? `bg-${appColor}-50 text-${appColor}` : "bg-default-100 text-default-600"}`}
                >
                  <span className="text-xl">{card.icon}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
