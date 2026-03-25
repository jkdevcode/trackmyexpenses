import type { DateFilterType } from "../types";

import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

import { useColorTheme } from "@/hooks/use-color-theme";

interface DateFilterProps {
  filter: DateFilterType;
  onChange: (filter: DateFilterType) => void;
}

export const DateFilter = ({ filter, onChange }: DateFilterProps) => {
  const { t } = useTranslation("dashboard");
  const { appColor } = useColorTheme();

  const filters: DateFilterType[] = ["day", "week", "month", "year"];

  return (
    <div className="flex items-center gap-2 bg-content2/50 p-1 rounded-lg w-fit">
      {filters.map((f) => (
        <Button
          key={f}
          className={`capitalize font-medium ${filter === f ? "shadow-md" : "text-default-500 hover:text-default-900"}`}
          color={filter === f ? appColor : "default"}
          size="sm"
          variant={filter === f ? "solid" : "light"}
          onPress={() => onChange(f)}
        >
          {t(`filters.${f}`)}
        </Button>
      ))}
    </div>
  );
};
