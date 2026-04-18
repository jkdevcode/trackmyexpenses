import type { InvoiceDateRangeValue } from "../hooks/useInvoiceFilters";

import { DateRangePicker } from "@heroui/date-picker";
import { getLocalTimeZone, today } from "@internationalized/date";

import { useColorTheme } from "@/hooks/use-color-theme";

interface InvoiceDateRangePickerProps {
  ariaLabel?: string;
  className?: string;
  label: string;
  value: InvoiceDateRangeValue;
  onChange: (value: InvoiceDateRangeValue) => void;
}

export const InvoiceDateRangePicker = ({
  ariaLabel,
  className,
  label,
  value,
  onChange,
}: InvoiceDateRangePickerProps) => {
  const { appColor } = useColorTheme();

  return (
    <DateRangePicker
      aria-label={ariaLabel ?? label}
      className={className}
      color={appColor}
      label={label}
      maxValue={today(getLocalTimeZone())}
      value={value}
      variant="bordered"
      onChange={onChange}
    />
  );
};
