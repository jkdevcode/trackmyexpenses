import type {
  ScanResponse,
  ProductSuggestion,
  CreateInvoiceWithFileDto,
  OcrSource,
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
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

import { formatCurrency } from "../utils/formatters";

import { InvoiceForm, type InvoiceFormValues } from "./InvoiceForm";
import { InvoiceUpload } from "./InvoiceUpload";
import { OcrSourceBadge } from "./OcrSourceBadge";

import { appColor } from "@/theme/theme.config";
import { appColorVariants } from "@/theme/app-color-variants";
import { useCreateInvoiceWithFileMutation } from "@/features/invoices/hooks/useInvoiceMutations";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const createInvoiceMutation = useCreateInvoiceWithFileMutation();
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

  const handleScanComplete = (data: ScanResponse, file: File) => {
    setScanData(data);
    setSelectedFile(file);
    setStep("edit");
  };

  const handlePreSave = (
    formData: InvoiceFormValues & { totalPagar: number; tasaCambio?: number },
    products: ProductSuggestion[],
  ) => {
    setPendingData({ formData, products });
    onConfirmOpen();
  };

  const handleConfirmSave = async () => {
    if (!pendingData) return;
    onConfirmClose();

    try {
      if (!selectedFile) {
        addToast({
          title: t("toast.error"),
          description: t("upload.missing_file_on_confirm"),
          color: "danger",
        });

        return;
      }

      const payload: CreateInvoiceWithFileDto = {
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
        ocrSource: scanData?.parsed?.source as OcrSource,
        file: selectedFile,
      };

      await createInvoiceMutation.mutateAsync(payload);

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
              <div className="max-w-4xl mx-auto mb-4 space-y-4">
                <div className="flex items-center justify-between bg-content1 p-4 rounded-xl border border-default-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-default-600">
                      {t("ocr.source.label")}:
                    </span>
                    <OcrSourceBadge
                      source={scanData.parsed.source as OcrSource}
                    />
                  </div>
                </div>

                {scanData.parsed.source === "fallback" && (
                  <Card className="border-none bg-warning-50 text-warning-700">
                    <CardBody className="py-2 px-3 text-sm flex-row items-center gap-2">
                      <span className="font-bold">⚠️</span>
                      {t("ocr.fallback_warning")}
                    </CardBody>
                  </Card>
                )}

                {(scanData.parsed.source as string) === "error" && (
                  <Card className="border-none bg-danger-50 text-danger-700">
                    <CardBody className="py-2 px-3 text-sm flex-row items-center gap-2">
                      <span className="font-bold">❌</span>
                      {t("ocr.error_message")}
                    </CardBody>
                  </Card>
                )}
              </div>

              <InvoiceForm
                initialData={scanData.parsed}
                saving={createInvoiceMutation.isPending}
                onCancel={() => {
                  setStep("upload");
                  setSelectedFile(null);
                  setScanData(null);
                }}
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
              isLoading={createInvoiceMutation.isPending}
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
