import type { TFunction } from "i18next";

import { isAxiosError } from "axios";

export type ApiErrorDetail = {
  field?: string;
  code: string;
  meta?: Record<string, unknown>;
};

export type ParsedApiError = {
  code: string;
  details: ApiErrorDetail[];
};

type BackendErrorBody = {
  code?: unknown;
  details?: unknown;
  error?: {
    code?: unknown;
    details?: unknown;
  };
  message?: string | string[];
};

const isApiErrorDetail = (detail: unknown): detail is ApiErrorDetail => {
  if (typeof detail !== "object" || detail === null) {
    return false;
  }

  const candidate = detail as ApiErrorDetail;

  return (
    typeof candidate.code === "string" &&
    (candidate.field === undefined || typeof candidate.field === "string") &&
    (candidate.meta === undefined ||
      (typeof candidate.meta === "object" && candidate.meta !== null))
  );
};

const normalizeDetails = (details: unknown): ApiErrorDetail[] => {
  if (!Array.isArray(details)) {
    return [];
  }

  return details.filter(isApiErrorDetail);
};

export const translateApiErrorCode = (code: string, t: TFunction): string =>
  t(`errors:${code}`, {
    defaultValue: t("errors:GENERIC_ERROR"),
  });

/**
 * Extracts the structured error from a backend response.
 * Always returns a ParsedApiError and never throws.
 */
export const parseApiError = (error: unknown): ParsedApiError => {
  if (!isAxiosError(error)) {
    return { code: "GENERIC_ERROR", details: [] };
  }

  const data = error.response?.data as BackendErrorBody | undefined;
  const code =
    typeof data?.error?.code === "string"
      ? data.error.code
      : typeof data?.code === "string"
        ? data.code
        : fallbackCode(error.response?.status);
  const details = normalizeDetails(data?.error?.details ?? data?.details);

  return { code, details };
};

/**
 * Builds a Map<fieldPath, translatedMessage> from structured details[].
 */
export const buildFieldErrorMap = (
  details: ApiErrorDetail[],
  t: TFunction,
): Map<string, string> => {
  const map = new Map<string, string>();

  for (const detail of details) {
    if (!detail.field || map.has(detail.field)) {
      continue;
    }

    map.set(detail.field, translateApiErrorCode(detail.code, t));
  }

  return map;
};

/**
 * Builds a Map<itemIndex, translatedMessage> from details[].
 * Field format expected: "items[N]" or "items[N].fieldName"
 */
export const buildItemErrorMap = (
  details: ApiErrorDetail[],
  t: TFunction,
): Map<number, string> => {
  const map = new Map<number, string>();

  for (const detail of details) {
    const match = detail.field?.match(/^items\[(\d+)\](?:\.|$)/);

    if (!match) {
      continue;
    }

    const index = Number.parseInt(match[1], 10);

    if (!map.has(index)) {
      map.set(index, translateApiErrorCode(detail.code, t));
    }
  }

  return map;
};

const fallbackCode = (status?: number): string => {
  if (!status) return "NETWORK_ERROR";
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 422) return "UNPROCESSABLE_ENTITY";
  if (status >= 500) return "SERVER_ERROR";

  return "GENERIC_ERROR";
};

/**
 * Legacy helper kept for backward compatibility.
 * New code should use parseApiError plus translateApiErrorCode directly.
 */
export const getErrorMessage = (error: unknown, t: TFunction): string => {
  const { code } = parseApiError(error);

  return translateApiErrorCode(code, t);
};
