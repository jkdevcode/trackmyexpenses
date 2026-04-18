import { Input } from "@heroui/input";
import { useTranslation } from "react-i18next";

import { useColorTheme } from "@/hooks/use-color-theme";
import { SearchIcon } from "@/components/ui/icons";

interface InvoiceSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const InvoiceSearchInput = ({
  value,
  onValueChange,
  placeholder,
  className = "max-w-xs",
}: InvoiceSearchInputProps) => {
  const { t } = useTranslation(["invoices"]);
  const inputPlaceholder = placeholder || t("modal.search");
  const { appColor } = useColorTheme();

  return (
    <Input
      aria-label={inputPlaceholder}
      className={className}
      placeholder={inputPlaceholder}
      color={appColor}
      size="md"
      variant="bordered"
      startContent={<SearchIcon className="text-default-400" />}
      value={value}
      onValueChange={onValueChange}
    />
  );
};
