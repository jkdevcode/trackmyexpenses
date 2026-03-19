import type {
  ScanResponse,
  ProductSuggestion,
  ConfirmFacturaDto,
} from "@/features/invoices/types";

import { useMemo, useState } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";
import { addToast } from "@heroui/toast";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

import { formatCurrency } from "../utils/formatters";

import { InvoiceForm } from "./InvoiceForm";
import { InvoiceUpload } from "./InvoiceUpload";

import { appColor } from "@/theme/theme.config";
import { appColorVariants } from "@/theme/app-color-variants";
import { useConfirmInvoiceMutation } from "@/features/invoices/hooks/useInvoiceMutations";
import { useSession } from "@/contexts/session-context";
import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "@/constants/currency";

type PendingData = {
  formData: {
    fechaHoraCompra: string;
    metodoPago: string;
    lugarCompra: string;
    nitProveedor?: string;
    totalPagar: number;
    moneda: string;
    tasaCambio?: number;
  };
  products: ProductSuggestion[];
};

const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const OcrInvoiceFlow = () => {
  const { t, i18n } = useTranslation(["invoices", "common"]);
  const { user } = useSession();
  const [step, setStep] = useState<"upload" | "edit">("upload");
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const confirmInvoiceMutation = useConfirmInvoiceMutation();
  const navigate = useNavigate();

  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const [pendingData, setPendingData] = useState<PendingData | null>(null);

  const baseCurrency = normalizeCurrencyCode(
    user?.monedaBase,
    DEFAULT_CURRENCY,
  );

  const handleScanComplete = (data: ScanResponse) => {
    setScanData(data);
    setStep("edit");
  };

  const handlePreSave = (
    formData: PendingData["formData"],
    products: ProductSuggestion[],
  ) => {
    setPendingData({ formData, products });
    onConfirmOpen();
  };

  const handleConfirmSave = async () => {
    if (!pendingData) return;
    onConfirmClose();

    try {
      const payload: ConfirmFacturaDto = {
        factura: {
          fechaHoraCompra: new Date(
            pendingData.formData.fechaHoraCompra,
          ).toISOString(),
          metodoPago: pendingData.formData.metodoPago,
          lugarCompra: pendingData.formData.lugarCompra.trim(),
          nitProveedor: pendingData.formData.nitProveedor?.trim() || undefined,
          totalPagar: pendingData.formData.totalPagar,
          moneda: pendingData.formData.moneda,
          tasaCambio: pendingData.formData.tasaCambio,
        },
        productos: pendingData.products
          .filter((p) => p.nombreDetected && p.nombreDetected.trim() !== "")
          .map((p) => ({
            nombreDetectado: p.nombreDetected.trim(),
            precioUnitario: Number(p.precioUnitario),
            cantidadDetectada: Number(p.cantidad),
            unidadDetectada: p.unidad || "u",
            descuentoDetectado: 0,
          })),
      };

      await confirmInvoiceMutation.mutateAsync(payload);

      addToast({
        title: t("toast.save_success_title"),
        description: t("toast.save_success_desc"),
        color: "success",
      });
      navigate("/dashboard");
    } catch (error) {
      void error;
      addToast({
        title: t("toast.save_error_title"),
        description: t("toast.save_error_desc"),
        color: "danger",
      });
    }
  };

  const totalBase = useMemo(() => {
    if (!pendingData) return null;

    if (pendingData.formData.moneda === baseCurrency) {
      return pendingData.formData.totalPagar;
    }

    if (!pendingData.formData.tasaCambio) {
      return null;
    }

    return roundCurrency(
      pendingData.formData.totalPagar * pendingData.formData.tasaCambio,
    );
  }, [pendingData, baseCurrency]);

  return (
    <>
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <m.div
              key="upload"
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
            >
              <InvoiceUpload onScanComplete={handleScanComplete} />
            </m.div>
          )}

          {step === "edit" && scanData && (
            <m.div
              key="edit"
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 20 }}
            >
              <InvoiceForm
                initialData={scanData.parsed}
                saving={confirmInvoiceMutation.isPending}
                onCancel={() => setStep("upload")}
                onSave={handlePreSave}
              />
            </m.div>
          )}
        </AnimatePresence>
      </LazyMotion>

      <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {t("confirm.title")}
          </ModalHeader>
          <ModalBody>
            <p>{t("confirm.message")}</p>
            <div className="bg-default-100 p-4 rounded-lg space-y-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">{t("confirm.products")}:</span>
                <span>{pendingData?.products.length}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-bold">{t("confirm.total")}:</span>
                <span className={`font-bold ${appColorVariants.textStrong}`}>
                  {formatCurrency(
                    pendingData?.formData.totalPagar || 0,
                    i18n.language,
                    pendingData?.formData.moneda,
                  )}
                </span>
              </div>
              {pendingData?.formData.moneda !== baseCurrency ? (
                <div className="flex justify-between text-sm text-default-600">
                  <span>{t("confirm.total_base")}:</span>
                  <span>
                    {totalBase === null
                      ? t("confirm.total_base_pending")
                      : formatCurrency(totalBase, i18n.language, baseCurrency)}
                  </span>
                </div>
              ) : null}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onConfirmClose}>
              {t("confirm.cancel")}
            </Button>
            <Button
              color={appColor}
              isLoading={confirmInvoiceMutation.isPending}
              onPress={handleConfirmSave}
            >
              {t("confirm.confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
