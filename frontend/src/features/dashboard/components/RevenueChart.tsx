import type { ExpenseData } from "../types";
import type {
  BarChart as BarChartType,
  Bar as BarType,
  XAxis as XAxisType,
  CartesianGrid as CartesianGridType,
  Tooltip as TooltipType,
  ResponsiveContainer as ResponsiveContainerType,
} from "recharts";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "@heroui/card";

import { useColorTheme } from "@/hooks/use-color-theme";
import { THEME_COLOR_MAP } from "@/theme/theme.config";

interface RevenueChartProps {
  data: ExpenseData[];
  loading: boolean;
}

export const RevenueChart = ({ data, loading }: RevenueChartProps) => {
  const { t } = useTranslation("dashboard");
  const { appColor } = useColorTheme();
  const [recharts, setRecharts] = useState<{
    BarChart: typeof BarChartType;
    Bar: typeof BarType;
    XAxis: typeof XAxisType;
    CartesianGrid: typeof CartesianGridType;
    Tooltip: typeof TooltipType;
    ResponsiveContainer: typeof ResponsiveContainerType;
  } | null>(null);

  useEffect(() => {
    void import("recharts").then(
      ({ BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer }) =>
        setRecharts({
          BarChart,
          Bar,
          XAxis,
          CartesianGrid,
          Tooltip,
          ResponsiveContainer,
        }),
    );
  }, []);

  // 1. Obtenemos los valores RGB del mapa usando appColor como key
  // Usamos 'dark' o 'light' dependiendo de tu modo, o simplemente uno por defecto
  const rgbValues = THEME_COLOR_MAP[appColor].dark;
  const chartColor = `rgb(${rgbValues})`;

  if (loading || !recharts) {
    return (
      <Card
        className="h-[300px] w-full animate-pulse bg-default-100"
        shadow="sm"
      >
        <CardBody />
      </Card>
    );
  }

  const { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } =
    recharts;

  return (
    <Card className="h-[300px] w-full" shadow="sm">
      <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
        <h3 className="text-lg font-semibold">{t("charts.revenue_title")}</h3>
      </CardHeader>
      <CardBody className="pb-4 h-full min-h-[250px]">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              axisLine={false}
              dataKey="name"
              dy={10}
              tick={{ fill: "#71717a", fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--heroui-default-100))",
                borderRadius: "8px",
                border: "1px solid hsl(var(--heroui-default-200))",
                color: "hsl(var(--heroui-foreground))",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.2)",
              }}
              labelStyle={{ color: "hsl(var(--heroui-default-500))" }}
              cursor={{ fill: "transparent" }}
            />
            <Bar
              radius={[4, 4, 0, 0]}
              barSize={40}
              // Opcional: una transición suave al hacer hover
              className="cursor-pointer hover:opacity-80 transition-opacity"
              dataKey="value"
              name={t("charts.legend.total")}
              // 2. Aplicamos el color procesado
              fill={chartColor}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};
