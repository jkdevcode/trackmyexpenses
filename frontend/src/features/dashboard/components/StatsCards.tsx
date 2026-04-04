import type { DashboardStats } from "../types";

import { Card, CardBody } from "@heroui/card";
import { useTranslation } from "react-i18next";
import { LazyMotion, domAnimation, m } from "framer-motion";

import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "../../invoices/utils/formatters";

import { useAppColorVariants } from "@/theme/app-color-variants";

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
  const appColorVariants = useAppColorVariants();

  const cards = [
    {
      key: "total_invoices",
      value: stats
        ? formatNumber(stats.totalInvoices, "es-CO", {
            maximumFractionDigits: 0,
          })
        : "...",
      label: t("stats.total_invoices"),
      icon: "📄", // Replace with actual icon component if desired
    },
    {
      key: "total_products",
      value: stats
        ? formatNumber(stats.totalProducts, "es-CO", {
            maximumFractionDigits: 0,
          })
        : "...",
      label: t("stats.total_products"),
      icon: "📦",
    },
    {
      key: "total_spent",
      value: stats ? formatCurrency(stats.totalSpent, "es-CO", "COP") : "...",
      label: t("stats.total_spent"),
      icon: "💰",
      highlight: true,
    },
    {
      key: "current_period",
      value: stats
        ? formatNumber(stats.currentPeriodInvoices, "es-CO", {
            maximumFractionDigits: 0,
          })
        : "...",
      label: t("stats.current_period"),
      subLabel:
        stats && stats.spendingTrend !== 0
          ? `${stats.spendingTrend > 0 ? "+" : ""}${formatPercent(
              stats.spendingTrend,
              "es-CO",
            )} ${t("stats.vs_last_period")}`
          : "",
      icon: "📅",
      trend: true,
    },
  ];

  if (loading) {
    const skeletonCards = [
      { id: "stats-skeleton-1" },
      { id: "stats-skeleton-2" },
      { id: "stats-skeleton-3" },
      { id: "stats-skeleton-4" },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skeletonCards.map((card) => (
          <Card
            key={card.id}
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
    <LazyMotion features={domAnimation}>
      <m.div
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial="hidden"
        variants={containerVariants}
      >
        {cards.map((card) => (
          <m.div key={card.key} variants={itemVariants}>
            <Card
              className="h-full border border-transparent hover:border-default-200 transition-colors"
              shadow="sm"
            >
              <CardBody className="gap-2 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-default-500 font-medium">
                      {card.label}
                    </span>
                    <span
                      className={`text-2xl font-bold ${card.highlight ? appColorVariants.textStrong : "text-foreground"}`}
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
                    className={`p-2 rounded-lg ${card.highlight ? appColorVariants.softBgText : "bg-default-100 text-default-600"}`}
                  >
                    <span className="text-xl">{card.icon}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </m.div>
        ))}
      </m.div>
    </LazyMotion>
  );
};
