import type { DragEventHandler, ReactNode } from "react";

import { Card, CardBody } from "@heroui/card";
import { useTranslation } from "react-i18next";

import { useAppColorVariants } from "@/theme/app-color-variants";
import { GalleryIcon } from "@/components/ui/icons";

interface InvoiceUploadDropzoneProps {
  dragActive: boolean;
  onDragEnter: DragEventHandler<HTMLDivElement>;
  onDragLeave: DragEventHandler<HTMLDivElement>;
  onDragOver: DragEventHandler<HTMLDivElement>;
  onDrop: DragEventHandler<HTMLDivElement>;
  children: ReactNode;
}

export const InvoiceUploadDropzone = ({
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  children,
}: InvoiceUploadDropzoneProps) => {
  const { t } = useTranslation("invoices");
  const appColorVariants = useAppColorVariants();

  return (
    <Card
      className={`w-full max-w-xl mx-auto border-2 border-dashed transition-colors ${
        dragActive
          ? `${appColorVariants.softBorder} ${appColorVariants.softBg}`
          : "border-default-300"
      }`}
    >
      <CardBody
        className="py-12 flex flex-col items-center justify-center gap-4 text-center"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <div className={`p-4 rounded-full mb-2 ${appColorVariants.softBgText}`}>
          <GalleryIcon size={48} />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-semibold">{t("upload.title")}</h3>
          <p className="text-default-500 text-sm">{t("upload.subtitle")}</p>
        </div>

        {children}
      </CardBody>
    </Card>
  );
};
