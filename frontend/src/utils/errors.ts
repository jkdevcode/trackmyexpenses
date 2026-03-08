import type { TFunction } from "i18next";

import { AxiosError, isAxiosError } from "axios";

type BackendErrorResponse = {
  message?: string | string[];
  error?: string;
};

/**
 * Helper to extract error message from backend response
 * @param error The error object (usually from try/catch)
 * @param t Translation function
 * @returns The translated error message
 */
export const getErrorMessage = (error: unknown, t: TFunction): string => {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    if (!axiosError.response) {
      return t("validation:generic", { defaultValue: "Network error" });
    }

    const data = axiosError.response.data;
    const rawMessage = data?.message;

    if (typeof rawMessage === "string") {
      return rawMessage;
    }
    if (Array.isArray(rawMessage) && rawMessage.length > 0) {
      return rawMessage.join(", ");
    }

    if (axiosError.response.status === 404) {
      return t("validation:not_found");
    }
    if (axiosError.response.status === 401) {
      return t("validation:unauthorized", { defaultValue: "Unauthorized" });
    }
    if (axiosError.response.status >= 500) {
      return t("validation:server_error", { defaultValue: "Server error" });
    }
  }

  return t("validation:generic");
};
