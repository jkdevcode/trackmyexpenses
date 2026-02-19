import { useState } from "react";

import { useTranslation } from "react-i18next";
import { InvoiceUpload } from "@/features/invoices/components/InvoiceUpload";
import { InvoiceForm } from "@/features/invoices/components/InvoiceForm";
import type {
  ScanResponse,
  ProductSuggestion,
  ConfirmFacturaDto,
} from "@/features/invoices/types";
import { motion, AnimatePresence } from "framer-motion";
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
import { appColor } from "@/theme/theme.config";
import { useConfirmInvoiceMutation } from "@/features/invoices/hooks/useInvoiceMutations";

export const NewInvoicePage = () => {
  const { t } = useTranslation("invoices");
  const [step, setStep] = useState<"upload" | "edit">("upload");
  const [scanData, setScanData] = useState<ScanResponse | null>(null);
  const confirmInvoiceMutation = useConfirmInvoiceMutation();
  const navigate = useNavigate();

  // Confirmation Dialog State
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const [pendingData, setPendingData] = useState<{
    formData: any;
    products: ProductSuggestion[];
  } | null>(null);

  const handleScanComplete = (data: ScanResponse) => {
    setScanData(data);
    setStep("edit");
  };

  const handlePreSave = (formData: any, products: ProductSuggestion[]) => {
    setPendingData({ formData, products });
    onConfirmOpen();
  };

  const handleConfirmSave = async () => {
    if (!pendingData) return;
    onConfirmClose(); // Close dialog, show loading on Form button if needed, or global loading

    try {
      const payload: ConfirmFacturaDto = {
        factura: {
          fechaHoraCompra: new Date(pendingData.formData.fechaHoraCompra).toISOString(),
          metodoPago: pendingData.formData.metodoPago,
          lugarCompra: pendingData.formData.lugarCompra.trim(),
          nitProveedor: pendingData.formData.nitProveedor?.trim() || undefined,
          totalPagar: pendingData.formData.totalPagar,
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
      console.error("Error saving invoice:", error);
      addToast({
        title: t("toast.save_error_title"),
        description: t("toast.save_error_desc"),
        color: "danger",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">
        {t("page.title", "Nueva Factura")}
      </h1>

      <AnimatePresence mode="wait">
        {step === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <InvoiceUpload onScanComplete={handleScanComplete} />
          </motion.div>
        )}

        {step === "edit" && scanData && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <InvoiceForm
              initialData={scanData.parsed}
              onSave={handlePreSave}
              onCancel={() => setStep("upload")}
              saving={confirmInvoiceMutation.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
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
                <span className={`font-bold text-${appColor}-600`}>
                  $
                  {new Intl.NumberFormat("es-CO").format(
                    pendingData?.formData.totalPagar || 0,
                  )}
                </span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onConfirmClose}>
              {t("confirm.cancel")}
            </Button>
            <Button
              color="primary"
              onPress={handleConfirmSave}
              isLoading={confirmInvoiceMutation.isPending}
            >
              {t("confirm.confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
