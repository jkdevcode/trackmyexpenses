import { Button, type ButtonProps } from "@heroui/button";
import { useTranslation } from "react-i18next";

interface GenerateReportButtonProps {
  loading: boolean;
  disabled: boolean;
  color?: ButtonProps["color"];
  onPress: () => void;
}

const GenerateReportButton = ({
  loading,
  disabled,
  color,
  onPress,
}: GenerateReportButtonProps) => {
  const { t } = useTranslation("reports");

  return (
    <Button
      className="w-full sm:w-auto self-start font-semibold"
      color={color ?? "primary"}
      isDisabled={disabled}
      isLoading={loading}
      onPress={onPress}
    >
      {t("reports:actions.generate")}
    </Button>
  );
};

export default GenerateReportButton;
