import { Spinner } from "@heroui/spinner";
import { useTranslation } from "react-i18next";

import { useColorTheme } from "@/hooks/use-color-theme";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner = ({ message }: LoadingSpinnerProps) => {
  const { t } = useTranslation("common");
  const { appColor } = useColorTheme();
  const resolvedMessage = message ?? t("common:loading.basic");

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-default-200 bg-content1/80 backdrop-blur px-6 py-8 shadow-lg">
        <div className="flex items-center justify-center">
          <Spinner color={appColor} size="lg" />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-default-600">
          {resolvedMessage}
        </p>
      </div>
    </div>
  );
};
