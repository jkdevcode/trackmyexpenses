import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { addToast } from "@heroui/toast";

import ReportFilters from "../components/ReportFilters";
import GenerateReportButton from "../components/GenerateReportButton";
import { useReport, useCheckReportData } from "../hooks/useReport";

import { useColorTheme } from "@/hooks/use-color-theme";

const ReportsPage = () => {
  const { t } = useTranslation("reports");
  const { appColor } = useColorTheme();
  const { downloadReport, loading, error, info } = useReport();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const validation = useMemo(() => {
    const hasFrom = Boolean(from);
    const hasTo = Boolean(to);
    const isRangeInvalid = hasFrom && hasTo && from > to;

    let fromError: string | null = null;
    let toError: string | null = null;

    if (!hasFrom && (hasTo || submitAttempted)) {
      fromError = t("reports:validation.from_required");
    }

    if (!hasTo && (hasFrom || submitAttempted)) {
      toError = t("reports:validation.to_required");
    }

    if (isRangeInvalid) {
      fromError = t("reports:validation.from_range");
      toError = t("reports:validation.to_range");
    }

    return {
      fromError,
      toError,
      isRangeInvalid,
      isValid: hasFrom && hasTo && !isRangeInvalid,
    };
  }, [from, to, submitAttempted, t]);

  const { data: checkData, isFetching: isChecking } = useCheckReportData(
    validation.isValid ? from : "",
    validation.isValid ? to : "",
  );

  const hasData = checkData?.hasData ?? true;

  const handleGenerate = async () => {
    setSubmitAttempted(true);

    if (!validation.isValid) return;

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

    await downloadReport(from, to);
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
          <CardBody className="mt-4 flex flex-col gap-4">
            <ReportFilters
              from={from}
              to={to}
              fromError={validation.fromError}
              toError={validation.toError}
              onFromChange={setFrom}
              onToChange={setTo}
            />

            {error && (
              <Card className="border border-danger-200 bg-danger-50">
                <CardBody className="text-danger-700 text-sm">{error}</CardBody>
              </Card>
            )}

            {info && (
              <Card className="border border-warning-200 bg-warning-50">
                <CardBody className="text-warning-700 text-sm">{info}</CardBody>
              </Card>
            )}

            <div className="flex flex-col gap-2">
              <GenerateReportButton
                color={appColor}
                disabled={!validation.isValid || loading || isChecking}
                loading={loading || isChecking}
                onPress={handleGenerate}
              />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
