import { useState } from "react";

import { useTranslation } from "react-i18next";
import { InvoiceUpload } from "@/features/invoices/InvoiceUpload";
import { InvoiceForm } from "@/features/invoices/InvoiceForm";
import { ScanResponse, ProductSuggestion } from "@/features/invoices/types";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "@/lib/axiosClient";
import { addToast } from "@heroui/toast";
import { useNavigate } from "react-router-dom";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { appColor } from "@/theme/theme.config";

export const NewInvoicePage = () => {
    const { t } = useTranslation("invoices");
    const [step, setStep] = useState<"upload" | "edit">("upload");
    const [scanData, setScanData] = useState<ScanResponse | null>(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    // Confirmation Dialog State
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const [pendingData, setPendingData] = useState<{ formData: any, products: ProductSuggestion[] } | null>(null);

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
        setSaving(true);
        onConfirmClose(); // Close dialog, show loading on Form button if needed, or global loading

        try {
            const payload = {
                factura: {
                    fechaHoraCompra: pendingData.formData.fechaHoraCompra,
                    metodoPago: pendingData.formData.metodoPago,
                    lugarCompra: pendingData.formData.lugarCompra,
                    nitProveedor: pendingData.formData.nitProveedor,
                    // totalPagar is calculated by backend or passed? Service ignores it and recalcs, 
                    // but we pass it effectively via the products loop. 
                    // DTO allows optional.
                },
                productos: pendingData.products.map(p => ({
                    nombreDetectado: p.nombreDetected,
                    precioUnitario: p.precioUnitario,
                    cantidadDetectada: p.cantidad,
                    unidadDetectada: p.unidad,
                    descuentoDetectado: 0 // Default for now
                }))
            };

            await axiosClient.post("/facturas/ocr/confirmar", payload);

            addToast({ title: "Factura Guardada", description: "La factura se ha registrado exitosamente.", color: "success" });
            navigate("/dashboard");

        } catch (error) {
            console.error("Error saving invoice:", error);
            addToast({ title: "Error", description: "No se pudo guardar la factura.", color: "danger" });
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <h1 className="text-3xl font-bold mb-6">{t("page.title", "Nueva Factura")}</h1>

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
                            saving={saving}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Dialog */}
            <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">{t("confirm.title")}</ModalHeader>
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
                                    ${new Intl.NumberFormat('es-CO').format(pendingData?.formData.totalPagar || 0)}
                                </span>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={onConfirmClose}>
                            {t("confirm.cancel")}
                        </Button>
                        <Button color="primary" onPress={handleConfirmSave} isLoading={saving}>
                            {t("confirm.confirm")}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};
