import { DatePicker } from "@heroui/date-picker";
import {
  getLocalTimeZone,
  parseDate,
  type DateValue,
  today,
} from "@internationalized/date";
import { useTranslation } from "react-i18next";

import { useColorTheme } from "@/hooks/use-color-theme";

interface ReportFiltersProps {
  from: string;
  to: string;
  fromError?: string | null;
  toError?: string | null;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

const parseDateValue = (value: string): DateValue | null => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseDate(value);
  }

  return null;
};

const ReportFilters = ({
  from,
  to,
  fromError,
  toError,
  onFromChange,
  onToChange,
}: ReportFiltersProps) => {
  const { t } = useTranslation("reports");
  const fromValue = parseDateValue(from);
  const toValue = parseDateValue(to);
  const { appColor } = useColorTheme();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DatePicker
        isRequired
        errorMessage={fromError ?? undefined}
        isInvalid={!!fromError}
        label={t("reports:filters.from")}
        color={appColor}
        value={fromValue}
        variant="bordered"
        maxValue={today(getLocalTimeZone())}
        onChange={(date: DateValue | null) =>
          onFromChange(date ? date.toString() : "")
        }
      />
      <DatePicker
        isRequired
        errorMessage={toError ?? undefined}
        isInvalid={!!toError}
        label={t("reports:filters.to")}
        color={appColor}
        value={toValue}
        variant="bordered"
        maxValue={today(getLocalTimeZone())}
        onChange={(date: DateValue | null) =>
          onToChange(date ? date.toString() : "")
        }
      />
    </div>
  );
};

export default ReportFilters;
