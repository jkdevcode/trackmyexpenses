import { useMutation } from "@tanstack/react-query";
import type { ConfirmFacturaDto } from "../types";
import { confirmInvoiceRequest, scanInvoiceRequest } from "../services/invoiceService";

export const useScanInvoiceMutation = () =>
  useMutation({
    mutationFn: (file: File) => scanInvoiceRequest(file),
  });

export const useConfirmInvoiceMutation = () =>
  useMutation({
    mutationFn: (payload: ConfirmFacturaDto) => confirmInvoiceRequest(payload),
  });
