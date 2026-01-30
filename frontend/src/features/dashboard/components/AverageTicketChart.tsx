import {
    LineChart,
    Line,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { ExpenseData } from "../hooks/useDashboardData";
import { THEME_COLOR_MAP, appColor } from "@/theme/theme.config";

interface AverageTicketChartProps {
    data: ExpenseData[];
    loading: boolean;
}

export const AverageTicketChart = ({ data, loading }: AverageTicketChartProps) => {
    const { t } = useTranslation("dashboard");

    // Get colors
    const primaryRgb = THEME_COLOR_MAP[appColor].dark;
    const primaryColor = `rgb(${primaryRgb})`;
    const secondaryColor = "#9333ea"; // Purple-ish for contrast or secondary metric

    if (loading) {
        return (
            <Card className="h-[300px] w-full animate-pulse bg-default-100" shadow="sm">
                <CardBody />
            </Card>
        );
    }

    return (
        <Card className="h-[300px] w-full" shadow="sm">
            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
                <h3 className="text-lg font-semibold">{t("charts.average_ticket_title")}</h3>
                <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: secondaryColor }}></span>
                        <span className="text-sm text-default-500">{t("charts.legend.total")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                        <span className="text-sm text-default-500">{t("charts.legend.average")}</span>
                    </div>
                </div>
            </CardHeader>
            <CardBody className="pb-4 h-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#71717a", fontSize: 12 }}
                            dy={10}
                        />
                        <Tooltip
                            cursor={{ stroke: primaryColor, strokeWidth: 1, strokeDasharray: "3 3" }}
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        />
                        {/* Total Line - Higher values typically */}
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={secondaryColor}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                            name={t("charts.legend.total")}
                        />
                        {/* Average Line */}
                        <Line
                            type="monotone"
                            dataKey="average"
                            stroke={primaryColor}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                            name={t("charts.legend.average")}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardBody>
        </Card>
    );
};
