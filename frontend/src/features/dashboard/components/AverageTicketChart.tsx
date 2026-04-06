import type { ExpenseData } from "../types";
import type {
  LineChart as LineChartType,
  Line as LineType,
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

interface AverageTicketChartProps {
  data: ExpenseData[];
  loading: boolean;
}

export const AverageTicketChart = ({
  data,
  loading,
}: AverageTicketChartProps) => {
  const { t } = useTranslation("dashboard");
  const { appColor } = useColorTheme();
  const [recharts, setRecharts] = useState<{
    LineChart: typeof LineChartType;
    Line: typeof LineType;
    XAxis: typeof XAxisType;
    CartesianGrid: typeof CartesianGridType;
    Tooltip: typeof TooltipType;
    ResponsiveContainer: typeof ResponsiveContainerType;
  } | null>(null);

  useEffect(() => {
    void import("recharts").then(
      ({
        LineChart,
        Line,
        XAxis,
        CartesianGrid,
        Tooltip,
        ResponsiveContainer,
      }) => {
        setRecharts({
          LineChart,
          Line,
          XAxis,
          CartesianGrid,
          Tooltip,
          ResponsiveContainer,
        });
      },
    );
  }, []);

  // Get colors
  const primaryRgb = THEME_COLOR_MAP[appColor].dark;
  const primaryColor = `rgb(${primaryRgb})`;
  const secondaryColor =
    appColor === "secondary"
      ? "#22c55e" // verde (ej: success)
      : "#9333ea"; // morado normal

  if (loading || !recharts) {
    return (
      <Card className="h-75 w-full animate-pulse bg-default-100" shadow="sm">
        <CardBody />
      </Card>
    );
  }

  const {
    LineChart,
    Line,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } = recharts;

  return (
    <Card className="h-75 w-full" shadow="sm">
      <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
        <h3 className="text-lg font-semibold">
          {t("charts.average_ticket_title")}
        </h3>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: secondaryColor }}
            />
            <span className="text-sm text-default-500">
              {t("charts.legend.total")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-sm text-default-500">
              {t("charts.legend.average")}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pb-4 h-full min-h-50">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              strokeOpacity={0.1}
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
              labelStyle={{
                color: "hsl(var(--heroui-default-500))",
              }}
              cursor={{
                stroke: primaryColor,
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
            />
            {/* Total Line - Higher values typically */}
            <Line
              activeDot={{ r: 6 }}
              dataKey="value"
              dot={false}
              name={t("charts.legend.total")}
              stroke={secondaryColor}
              strokeWidth={2}
              type="monotone"
            />
            {/* Average Line */}
            <Line
              activeDot={{ r: 6 }}
              dataKey="average"
              dot={false}
              name={t("charts.legend.average")}
              stroke={primaryColor}
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};
