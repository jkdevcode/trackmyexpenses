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
import { appColor } from "@/theme/theme.config";

interface RevenueChartProps {
    data: ExpenseData[];
    loading: boolean;
}

export const RevenueChart = ({ data, loading }: RevenueChartProps) => {
    const { t } = useTranslation("dashboard");

    if (loading) {
        return (
            <Card className="h-[400px] w-full animate-pulse bg-default-100" shadow="sm">
                <CardBody />
            </Card>
        );
    }

    // Simplified color mapping for demo, respecting appColor logic if possible or using consistent vars
    // Since we can't easily access Tailwind colors in JS without hook, we'll use a CSS variable or a hardcoded fallback that matches 'education' theme often
    const chartColor = "#8884d8"; // You might want to map 'appColor' to specific hex codes here

    return (
        <Card className="h-[400px] w-full" shadow="sm">
            <CardHeader className="flex flex-col items-start px-6 pt-6 pb-0">
                <h3 className="text-lg font-semibold">{t("charts.revenue_title")}</h3>
            </CardHeader>
            <CardBody className="pb-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#71717a", fontSize: 12 }}
                            dy={10}
                        />
                        {/* <YAxis hide /> */}
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        />
                        <Bar
                            dataKey="value"
                            fill={chartColor}
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                            className={`fill-${appColor}-500/80 hover:fill-${appColor}-500 transition-all`}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardBody>
        </Card>
    );
};
