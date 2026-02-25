import type { ConfirmFacturaDto, ScanResponse } from "../types";

import axiosClient from "@/lib/axiosClient";

export const scanInvoiceRequest = async (file: File) => {
  const formData = new FormData();

  formData.append("image", file);

  const response = await axiosClient.post<ScanResponse>(
    "/facturas/ocr",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return response.data;
};

export const confirmInvoiceRequest = async (payload: ConfirmFacturaDto) => {
  const response = await axiosClient.post("/facturas/ocr/confirmar", payload);

  return response.data;
};
