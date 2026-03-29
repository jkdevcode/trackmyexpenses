import { addToast } from "@heroui/toast";
import { useTranslation } from "react-i18next";

import {
  buildFieldErrorMap,
  buildItemErrorMap,
  parseApiError,
  translateApiErrorCode,
} from "@/utils/errors";

export type InvoiceErrorToastResult = {
  code: string;
  message: string;
  itemErrors: Map<number, string>;
  fieldErrors: Map<string, string>;
  hasFieldErrors: boolean;
};

/**
 * Shows a translated invoice error toast and returns the parsed field maps so
 * the caller can render inline errors without duplicating parsing logic.
 */
export const useInvoiceErrorToast = () => {
  const { t } = useTranslation(["invoices", "errors"]);

  return (error: unknown): InvoiceErrorToastResult => {
    const { code, details } = parseApiError(error);
    const fieldErrors = buildFieldErrorMap(details, t);
    const itemErrors = buildItemErrorMap(details, t);
    const firstFieldMessage = fieldErrors.values().next().value as
      | string
      | undefined;
    const hasFieldErrors = fieldErrors.size > 0;

    const message =
      itemErrors.size > 0
        ? t("errors:ITEMS_HAS_ERRORS", {
            count: itemErrors.size,
            defaultValue: `${itemErrors.size} item(s) need attention.`,
          })
        : (firstFieldMessage ?? translateApiErrorCode(code, t));

    addToast({
      title: t("invoices:toast.error"),
      description: message,
      color: "danger",
    });

    return {
      code,
      message,
      itemErrors,
      fieldErrors,
      hasFieldErrors,
    };
  };
};
