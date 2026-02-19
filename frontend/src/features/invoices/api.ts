import type { ConfirmFacturaDto, ScanResponse } from "./types";
import { useMutation } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";

export const useScanInvoiceMutation = () =>
  useMutation({
    mutationFn: async (file: File) => {
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
    },
  });

export const useConfirmInvoiceMutation = () =>
  useMutation({
    mutationFn: async (payload: ConfirmFacturaDto) => {
      const response = await axiosClient.post(
        "/facturas/ocr/confirmar",
        payload,
      );
      return response.data;
    },
  });
