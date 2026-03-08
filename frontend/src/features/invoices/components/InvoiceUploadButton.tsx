import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

import { appColor } from "@/theme/theme.config";

interface InvoiceUploadButtonProps {
  disabled: boolean;
  loading: boolean;
}

export const InvoiceUploadButton = ({
  disabled,
  loading,
}: InvoiceUploadButtonProps) => {
  const { t } = useTranslation("invoices");

  return (
    <Button
      aria-label={t("upload.select_file")}
      color={appColor}
      isLoading={loading}
      isDisabled={disabled}
      onPress={() => document.getElementById("invoice-upload")?.click()}
    >
      {loading ? t("upload.processing") : t("upload.select_file")}
    </Button>
  );
};
