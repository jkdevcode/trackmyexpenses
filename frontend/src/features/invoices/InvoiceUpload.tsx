import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";
import { appColor } from "@/theme/theme.config";
import { ScanResponse } from "./types";
import { addToast } from "@heroui/toast";
import { GalleryIcon } from "@/components/ui/icons";
import { useScanInvoiceMutation } from "./api";

interface InvoiceUploadProps {
  onScanComplete: (data: ScanResponse) => void;
}

export const InvoiceUpload = ({ onScanComplete }: InvoiceUploadProps) => {
  const { t } = useTranslation("invoices");
  const scanInvoiceMutation = useScanInvoiceMutation();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      addToast({
        title: "Error",
        description: t("upload.invalid_type"),
        color: "danger",
      });
      return;
    }

    try {
      const data = await scanInvoiceMutation.mutateAsync(file);
      onScanComplete(data as ScanResponse);
      addToast({
        title: "Exito",
        description: t("upload.success"),
        color: "success",
      });
    } catch (error) {
      console.error(error);
      addToast({
        title: "Error",
        description: t("upload.error"),
        color: "danger",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <Card
      className={`w-full max-w-xl mx-auto border-2 border-dashed transition-colors ${dragActive ? `border-${appColor}-500 bg-${appColor}-50` : "border-default-300"}`}
    >
      <CardBody
        className="py-12 flex flex-col items-center justify-center gap-4 text-center"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div
          className={`p-4 rounded-full bg-default-100 text-${appColor}-500 mb-2`}
        >
          <GalleryIcon size={48} />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-semibold">{t("upload.title")}</h3>
          <p className="text-default-500 text-sm">{t("upload.subtitle")}</p>
        </div>

        <div className="flex gap-2 mt-2">
          <input
            id="invoice-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={scanInvoiceMutation.isPending}
          />
          <Button
            color={appColor}
            isLoading={scanInvoiceMutation.isPending}
            onPress={() => document.getElementById("invoice-upload")?.click()}
          >
            {scanInvoiceMutation.isPending
              ? t("upload.processing")
              : t("upload.select_file")}
          </Button>
        </div>

        <p className="text-xs text-default-400 mt-2">
          JPEG, PNG, WEBP (Max 5MB)
        </p>
      </CardBody>
    </Card>
  );
};
