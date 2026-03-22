import type { OcrSource } from "../types";

import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { useTranslation } from "react-i18next";

interface OcrSourceBadgeProps {
  source?: OcrSource;
}

export const OcrSourceBadge = ({ source }: OcrSourceBadgeProps) => {
  const { t } = useTranslation("invoices");

  if (!source) return null;

  const config = {
    ai: {
      color: "success" as const,
      label: t("ocr.source.ai"),
      tooltip: t("ocr.source.ai_tooltip"),
    },
    "ai-image": {
      color: "success" as const,
      label: t("ocr.source.ai"),
      tooltip: t("ocr.source.ai_tooltip"),
    },
    ocr: {
      color: "warning" as const,
      label: t("ocr.source.ocr"),
      tooltip: t("ocr.source.ocr_tooltip"),
    },
    fallback: {
      color: "danger" as const,
      label: t("ocr.source.fallback"),
      tooltip: t("ocr.source.fallback_tooltip"),
    },
  };

  const current = source ? config[source] : null;

  if (!current) return null;

  return (
    <Tooltip content={current.tooltip} placement="top">
      <Chip
        color={current.color}
        size="sm"
        variant="flat"
        className="font-medium"
      >
        {current.label}
      </Chip>
    </Tooltip>
  );
};
