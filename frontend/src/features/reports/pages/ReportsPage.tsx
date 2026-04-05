import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";

import GenerateReportButton from "../components/GenerateReportButton";
import { useReport, useCheckReportData } from "../hooks/useReport";

import { useColorTheme } from "@/hooks/use-color-theme";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useInvoiceFilters } from "@/features/invoices/hooks/useInvoiceFilters";
import { PeriodFilter } from "@/components/filters/PeriodFilter";
import {
  formatRange,
  getPresetRanges,
  rangesEqual,
} from "@/features/invoices/utils/date-periods";

const ReportsPage = () => {
  const { t } = useTranslation(["reports", "invoices"]);
  const { t: tMeta } = useTranslation("meta");
  const { appColor } = useColorTheme();
  const { downloadReport, loading, error, info } = useReport();

  const { filter, dateRangeValue, setPeriod, setDateRangeValue } =
    useInvoiceFilters({
      period: "month",
    });

  usePageMeta({
    title: tMeta("reports.title"),
    description: tMeta("reports.description"),
  });

  const rangeLabel = useMemo(() => {
    if (filter.period === "all") return t("reports:filters.all_time");

    if (filter.period !== "custom") {
      return t(`invoices:filters.${filter.period}`);
    }

    if (dateRangeValue) {
      const presets = getPresetRanges();

      for (const [key, range] of Object.entries(presets)) {
        if (rangesEqual(range, dateRangeValue)) {
          return t(`invoices:filters.${key}`);
        }
      }

      return formatRange(dateRangeValue);
    }

    return "";
  }, [filter, dateRangeValue, t]);

  const { data: checkData, isFetching: isChecking } = useCheckReportData(
    filter.period,
    filter.startDate,
    filter.endDate,
  );

  const hasData = checkData?.hasData ?? true;

  const handleGenerate = async () => {
    if (!filter.period) return;

    if (!hasData) {
      addToast({
        title: t("reports:info.no_data"),
        description: t("reports:validation.REPORT_NO_DATA"),
        color: "warning",
        variant: "flat",
        timeout: 4000,
      });

      return;
    }

    await downloadReport(filter.period, filter.startDate, filter.endDate);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-background min-h-full w-full gap-6">
      <div className="max-w-3xl w-full flex flex-col gap-6">
        <h1 className="text-2xl font-bold ml-2">{t("reports:title")}</h1>

        <Card className="w-full shadow-lg rounded-2xl p-2">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h2 className="text-xl font-semibold">{t("reports:card.title")}</h2>
            <p className="text-default-500 text-sm">
              {t("reports:card.description")}
            </p>
          </CardHeader>
          <CardBody className="mt-4 flex flex-col gap-6">
            <div className="bg-content2/30 p-4 rounded-2xl border border-default-100">
              <PeriodFilter
                dateRangeValue={dateRangeValue}
                translationNamespace="invoices"
                value={filter.period}
                onChange={setPeriod}
                onDateRangeChange={setDateRangeValue}
              />
            </div>

            <Divider className="my-2 opacity-50" />

            <div className="flex flex-col items-center gap-6 py-4">
              {rangeLabel && (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <span className="text-default-500 text-[11px] uppercase font-bold tracking-[0.1em] mb-1">
                    {t("reports:filters.range_label")}
                  </span>
                  <span className="text-2xl font-black text-default-900 leading-tight">
                    {rangeLabel}
                  </span>
                </div>
              )}

              <GenerateReportButton
                color={appColor}
                disabled={!filter.period || loading || isChecking}
                loading={loading || isChecking}
                onPress={handleGenerate}
              />
            </div>

            {(error || info) && (
              <div className="flex flex-col gap-3">
                {error && (
                  <Card className="border border-danger-200 bg-danger-50 shadow-none">
                    <CardBody className="text-danger-700 text-sm py-3 px-4">
                      {error}
                    </CardBody>
                  </Card>
                )}

                {info && (
                  <Card className="border border-warning-200 bg-warning-50 shadow-none">
                    <CardBody className="text-warning-700 text-sm py-3 px-4">
                      {info}
                    </CardBody>
                  </Card>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
