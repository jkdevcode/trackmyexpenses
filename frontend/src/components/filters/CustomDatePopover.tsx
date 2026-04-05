import type { InvoiceDateRangeValue } from "../../features/invoices/hooks/useInvoiceFilters";

import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Modal, ModalBody, ModalContent, ModalFooter } from "@heroui/modal";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { useDisclosure } from "@heroui/use-disclosure";
import { getLocalTimeZone, startOfMonth, today } from "@internationalized/date";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { InvoiceDateRangePicker } from "../../features/invoices/components/InvoiceDateRangePicker";

import { CalendarIcon } from "@/components/ui/icons";
import { useColorTheme } from "@/hooks/use-color-theme";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const tz = getLocalTimeZone();

/** Compute preset ranges using @internationalized/date helpers */
function getPresetRanges(): Record<string, InvoiceDateRangeValue> {
  const todayDate = today(tz);

  // Last 7 days: 6 days back → today
  const last7Start = todayDate.subtract({ days: 6 });

  // Last 30 days: 29 days back → today
  const last30Start = todayDate.subtract({ days: 29 });

  // Last 3 months: first day of 3 months ago → today
  const last3MonthsStart = startOfMonth(todayDate.subtract({ months: 2 }));

  // Last 6 months
  const last6MonthsStart = startOfMonth(todayDate.subtract({ months: 5 }));

  // Last 1 year
  const last1YearStart = startOfMonth(todayDate.subtract({ months: 11 }));

  return {
    today: { start: todayDate, end: todayDate },
    last_7_days: { start: last7Start, end: todayDate },
    last_30_days: { start: last30Start, end: todayDate },
    last_3_months: { start: last3MonthsStart, end: todayDate },
    last_6_months: { start: last6MonthsStart, end: todayDate },
    last_1_year: { start: last1YearStart, end: todayDate },
  };
}

/** Format a committed value into "Apr 1 – Apr 30" style */
function formatRange(value: InvoiceDateRangeValue): string {
  if (!value) return "";
  const fmt = (d: { month: number; day: number; year: number }) =>
    new Date(d.year, d.month - 1, d.day).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  const start = fmt(value.start);
  const end = fmt(value.end);

  return start === end ? start : `${start} – ${end}`;
}

/** True if two InvoiceDateRangeValues represent the same interval */
function rangesEqual(
  a: InvoiceDateRangeValue,
  b: InvoiceDateRangeValue,
): boolean {
  if (!a || !b) return false;

  return (
    a.start.toString() === b.start.toString() &&
    a.end.toString() === b.end.toString()
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CustomDatePopoverProps {
  /**
   * The committed date range coming from the parent filter state.
   * When the active period is not custom, this keeps the last selected range.
   */
  value: InvoiceDateRangeValue;
  /** Called when a preset is clicked (immediate commit) or Apply is pressed. */
  onChange: (value: InvoiceDateRangeValue) => void;
  /**
   * Called when the user presses "Clear dates".
   */
  onClearDates: () => void;
  /** True when the parent period === "custom". Controls trigger visual state. */
  isCustomActive: boolean;
  translationNamespace: "dashboard" | "invoices";
  /**
   * When true, renders a full-page dark scrim behind the popover.
   * Use on the Dashboard to cut through chart visual noise.
   */
  showBackdrop?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CustomDatePopover = ({
  value,
  onChange,
  onClearDates,
  isCustomActive,
  translationNamespace,
  showBackdrop = false,
}: CustomDatePopoverProps) => {
  const { t } = useTranslation(translationNamespace);
  const { appColor } = useColorTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Local draft used while the user is manually adjusting the calendar.
  const [draftValue, setDraftValue] = useState<InvoiceDateRangeValue>(null);

  // "✓ Applied" flash state after a preset is clicked
  const [appliedFlash, setAppliedFlash] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect mobile to switch between Popover and Modal
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");

    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  // Cleanup flash timer on unmount
  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const wasCustomActiveRef = useRef(isCustomActive);

  // Close the popover if the active filter leaves custom mode while open.
  useEffect(() => {
    if (wasCustomActiveRef.current && !isCustomActive && isOpen) {
      onClose();
    }
    wasCustomActiveRef.current = isCustomActive;
  }, [isCustomActive, isOpen, onClose]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleTriggerClick = () => {
    setDraftValue(value);
    onOpen();
  };

  const handlePresetClick = (presetKey: string) => {
    const ranges = getPresetRanges();
    const presetRange = ranges[presetKey];

    if (!presetRange) return;

    onChange(presetRange);
    onClose();

    // Trigger "✓ Applied" flash
    setAppliedFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setAppliedFlash(false), 800);
  };

  const handleApply = () => {
    onChange(draftValue);
    onClose();
  };

  const handleCancel = () => {
    setDraftValue(value);
    onClose();
  };

  const handleClearDates = () => {
    onClearDates();
    onClose();
  };

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------

  const presets = [
    "today",
    "last_7_days",
    "last_30_days",
    "last_3_months",
    "last_6_months",
    "last_1_year",
  ] as const;

  const presetRanges = getPresetRanges();

  const formattedRange = formatRange(value);
  const hasActiveRange = isCustomActive && !!value;

  // Determine trigger label
  const triggerLabel = appliedFlash
    ? t("filters.applied_flash")
    : hasActiveRange
      ? `${t("filters.range_trigger")}: ${formattedRange}`
      : t("filters.range_trigger");

  // Trigger color/variant
  const triggerVariant = hasActiveRange
    ? "solid"
    : isCustomActive
      ? "bordered"
      : "bordered";

  // ---------------------------------------------------------------------------
  // Popover/Modal shared content
  // ---------------------------------------------------------------------------

  const popoverContent = (
    <div className="flex flex-col gap-4 p-1">
      {/* Presets */}
      <div>
        <p className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">
          {t("filters.custom_range")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((key) => {
            const isActive = rangesEqual(value, presetRanges[key]);

            return (
              <Button
                key={key}
                className="text-xs font-medium"
                color={appColor}
                fullWidth
                radius="full"
                size="sm"
                variant={isActive ? "solid" : "flat"}
                onPress={() => handlePresetClick(key)}
              >
                {t(`filters.${key}`)}
              </Button>
            );
          })}
        </div>
      </div>

      <Divider />

      {/* Calendar */}
      <div>
        <InvoiceDateRangePicker
          ariaLabel={t("filters.custom_range")}
          className="w-full"
          label={t("filters.custom_range")}
          value={draftValue}
          onChange={setDraftValue}
        />
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between pt-4 border-t border-default-100">
      <Button
        color="warning"
        isDisabled={!hasActiveRange}
        size="sm"
        variant="light"
        onPress={handleClearDates}
      >
        {t("filters.clear_dates")}
      </Button>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="flat" onPress={handleCancel}>
          {t("filters.cancel")}
        </Button>
        <Button
          color={appColor}
          isDisabled={!draftValue}
          size="sm"
          variant="solid"
          onPress={handleApply}
        >
          {t("filters.apply")}
        </Button>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Trigger button
  // ---------------------------------------------------------------------------

  const triggerButton = (
    <Button
      className="font-medium transition-all duration-200"
      color={appliedFlash ? "success" : appColor}
      endContent={
        hasActiveRange ? (
          <button
            aria-label="Clear custom range"
            className="ml-1 rounded-full p-0.5 hover:bg-white/20 transition-transform hover:rotate-90 duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleClearDates();
            }}
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        ) : (
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )
      }
      size="md"
      startContent={<CalendarIcon />}
      variant={appliedFlash ? "flat" : triggerVariant}
      onPress={handleTriggerClick}
    >
      {/* Active range badge with entrance animation */}
      <AnimatePresence mode="wait">
        <m.span
          key={triggerLabel}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          {triggerLabel}
        </m.span>
      </AnimatePresence>
    </Button>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <LazyMotion features={domAnimation}>
      <>
        {/* Dashboard backdrop scrim */}
        <AnimatePresence>
          {showBackdrop && isOpen && (
            <m.div
              key="backdrop"
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[50]"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleCancel}
            />
          )}
        </AnimatePresence>

        {/* MOBILE: Bottom sheet Modal */}
        {isMobile ? (
          <>
            {triggerButton}
            <Modal
              classNames={{
                base: "m-0 rounded-t-2xl rounded-b-none",
                backdrop: "z-[60]",
                wrapper: "z-[70] items-end",
              }}
              isOpen={isOpen}
              motionProps={{
                variants: {
                  enter: {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.25, ease: "easeOut" },
                  },
                  exit: {
                    y: 80,
                    opacity: 0,
                    transition: { duration: 0.2, ease: "easeIn" },
                  },
                },
              }}
              size="full"
              onClose={handleCancel}
            >
              <ModalContent>
                <ModalBody className="overflow-y-auto max-h-[70vh] py-4">
                  <h3 className="text-base font-semibold text-default-700 mb-2">
                    {t("filters.custom_range")}
                  </h3>
                  {popoverContent}
                </ModalBody>
                <ModalFooter className="sticky bottom-0 bg-content1 border-t border-default-100 flex items-center justify-between">
                  {footer}
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        ) : (
          /* DESKTOP: Anchored Popover */
          <Popover
            classNames={{
              base: "z-[60]",
              content:
                "min-w-[320px] max-w-[380px] rounded-2xl border border-default-200 bg-content1 shadow-[0_8px_40px_rgba(0,0,0,0.18)] p-4",
            }}
            isOpen={isOpen}
            placement="bottom-end"
            onOpenChange={(open) => {
              if (open) {
                setDraftValue(value);
                onOpen();
              } else {
                handleCancel();
              }
            }}
          >
            <PopoverTrigger>{triggerButton}</PopoverTrigger>
            <PopoverContent>
              <m.div
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
                exit={{ opacity: 0, y: 6 }}
                initial={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-default-700">
                    {t("filters.custom_range")}
                  </h3>
                  <Button
                    isIconOnly
                    aria-label="Close"
                    className="text-default-400"
                    size="sm"
                    variant="light"
                    onPress={handleCancel}
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
                {popoverContent}
                {footer}
              </m.div>
            </PopoverContent>
          </Popover>
        )}
      </>
    </LazyMotion>
  );
};
