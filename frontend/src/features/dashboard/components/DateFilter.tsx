import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";
import { appColor } from "@/theme/theme.config";
import type { DateFilterType } from "../types";

interface DateFilterProps {
  filter: DateFilterType;
  onChange: (filter: DateFilterType) => void;
}

export const DateFilter = ({ filter, onChange }: DateFilterProps) => {
  const { t } = useTranslation("dashboard");

  const filters: DateFilterType[] = ["day", "week", "month", "year"];

  return (
    <div className="flex items-center gap-2 bg-content2/50 p-1 rounded-lg w-fit">
      {filters.map((f) => (
        <Button
          key={f}
          size="sm"
          variant={filter === f ? "solid" : "light"}
          color={filter === f ? appColor : "default"}
          className={`capitalize font-medium ${filter === f ? "shadow-md" : "text-default-500 hover:text-default-900"}`}
          onPress={() => onChange(f)}
        >
          {t(`filters.${f}`)}
        </Button>
      ))}
    </div>
  );
};
