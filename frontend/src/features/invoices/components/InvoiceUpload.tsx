import type { ScanResponse } from "../types";

import { useTranslation } from "react-i18next";

import { useInvoiceUpload } from "../hooks/useInvoiceUpload";
import { INVOICE_UPLOAD_ACCEPT } from "../constants/upload";

import { InvoiceUploadButton } from "./InvoiceUploadButton";
import { InvoiceUploadDropzone } from "./InvoiceUploadDropzone";

interface InvoiceUploadProps {
  onScanComplete: (data: ScanResponse) => void;
}

export const InvoiceUpload = ({ onScanComplete }: InvoiceUploadProps) => {
  const { t } = useTranslation("invoices");
  const { dragActive, isPending, handleDrop, handleDrag, handleChange } =
    useInvoiceUpload({
      onScanComplete,
      t,
    });

  return (
    <InvoiceUploadDropzone
      dragActive={dragActive}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex gap-2 mt-2">
        <input
          accept={INVOICE_UPLOAD_ACCEPT}
          aria-label="Upload invoice image"
          className="hidden"
          disabled={isPending}
          id="invoice-upload"
          type="file"
          onChange={handleChange}
        />
        <InvoiceUploadButton disabled={isPending} loading={isPending} />
      </div>

      <p className="text-xs text-default-400 mt-2">
        PDF, JPEG, PNG, WEBP (Max 5MB)
      </p>
    </InvoiceUploadDropzone>
  );
};
