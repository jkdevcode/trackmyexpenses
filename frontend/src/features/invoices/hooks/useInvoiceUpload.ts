import type { ChangeEvent, DragEvent } from "react";
import type { TFunction } from "i18next";
import type { ScanResponse } from "../types";

import { useState } from "react";
import { addToast } from "@heroui/toast";

import {
  ALLOWED_INVOICE_UPLOAD_MIME_TYPES,
  MAX_INVOICE_UPLOAD_SIZE,
} from "../constants/upload";

import { useScanInvoiceMutation } from "./useInvoiceMutations";

import { getErrorMessage } from "@/utils/errors";

const allowedMimeTypes = new Set<string>(ALLOWED_INVOICE_UPLOAD_MIME_TYPES);

const isAllowedFileType = (file: File): boolean => {
  if (allowedMimeTypes.has(file.type)) {
    return true;
  }

  return file.type.startsWith("image/");
};

interface UseInvoiceUploadParams {
  onScanComplete: (data: ScanResponse, file: File) => void;
  t: TFunction<"invoices">;
}

export const useInvoiceUpload = ({
  onScanComplete,
  t,
}: UseInvoiceUploadParams) => {
  const scanInvoiceMutation = useScanInvoiceMutation();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!isAllowedFileType(file)) {
      addToast({
        title: t("toast.error"),
        description: t("upload.invalid_type"),
        color: "danger",
      });

      return;
    }

    if (file.size > MAX_INVOICE_UPLOAD_SIZE) {
      addToast({
        title: t("toast.error"),
        description: t("upload.invalid_size"),
        color: "danger",
      });

      return;
    }

    try {
      const data = await scanInvoiceMutation.mutateAsync(file);

      onScanComplete(data, file);
      addToast({
        title: t("toast.success"),
        description: t("upload.success"),
        color: "success",
      });
    } catch (error: unknown) {
      addToast({
        title: t("toast.error"),
        description: getErrorMessage(error, t),
        color: "danger",
      });
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      void handleFile(droppedFile);
    }
  };

  const handleDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      void handleFile(selectedFile);
    }
  };

  return {
    dragActive,
    isPending: scanInvoiceMutation.isPending,
    handleDrop,
    handleDrag,
    handleChange,
  };
};
