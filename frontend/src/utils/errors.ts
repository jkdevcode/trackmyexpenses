import { AxiosError } from "axios";

/**
 * Helper to extract error message from backend response
 * @param error The error object (usually from try/catch)
 * @param t Translation function
 * @returns The translated error message
 */
export const getErrorMessage = (
  error: unknown,
  t: (key: string, options?: any) => string,
): string => {
  if (error instanceof Error) {
    // Check for Axios Error
    const axiosError = error as AxiosError<any>;

    if (axiosError.response) {
      // Backend returned a response with error status
      const data = axiosError.response.data;

      // If backend returns a message key or text
      if (data?.message) {
        return data.message;
      }

      // Fallback based on status code
      if (axiosError.response.status === 404) {
        return t("validation:generic"); // Or specific not found
      }
      if (axiosError.response.status === 401) {
        return t("validation:unauthorized", { defaultValue: "Unauthorized" });
      }
      if (axiosError.response.status === 500) {
        return t("validation:server_error", { defaultValue: "Server Error" });
      }
    }
  }

  return t("validation:generic");
};
