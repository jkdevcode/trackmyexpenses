import {
  BarChart,
  Bar,
  XAxis,
  // YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { ExpenseData } from "../hooks/useDashboardData";
import { THEME_COLOR_MAP, appColor } from "@/theme/theme.config";

interface RevenueChartProps {
  data: ExpenseData[];
  loading: boolean;
}

export const RevenueChart = ({ data, loading }: RevenueChartProps) => {
  const { t } = useTranslation("dashboard");

  // 1. Obtenemos los valores RGB del mapa usando appColor como key
  // Usamos 'dark' o 'light' dependiendo de tu modo, o simplemente uno por defecto
  const rgbValues = THEME_COLOR_MAP[appColor].dark;
  const chartColor = `rgb(${rgbValues})`;

  if (loading) {
    return (
      <Card
        className="h-[300px] w-full animate-pulse bg-default-100"
        shadow="sm"
      >
        <CardBody />
      </Card>
    );
  }

  return (
    <Card className="h-[300px] w-full" shadow="sm">
      <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
        <h3 className="text-lg font-semibold">{t("charts.revenue_title")}</h3>
      </CardHeader>
      <CardBody className="pb-4 h-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
              dy={10}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar
              dataKey="value"
              // 2. Aplicamos el color procesado
              fill={chartColor}
              radius={[4, 4, 0, 0]}
              barSize={40}
              // Opcional: una transición suave al hacer hover
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};
