import type {
  ConfirmFacturaDto,
  CreateFacturaDto,
  ProductCatalogItem,
  UpdateFacturaDto,
} from "../types";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  confirmInvoiceRequest,
  createInvoiceRequest,
  deleteInvoiceRequest,
  getProductsRequest,
  scanInvoiceRequest,
  updateInvoiceRequest,
} from "../services/invoiceService";

export const useScanInvoiceMutation = () =>
  useMutation({
    mutationFn: (file: File) => scanInvoiceRequest(file),
  });

export const useConfirmInvoiceMutation = () =>
  useMutation({
    mutationFn: (payload: ConfirmFacturaDto) => confirmInvoiceRequest(payload),
  });

export const useCreateInvoiceMutation = () =>
  useMutation({
    mutationFn: (payload: CreateFacturaDto) => createInvoiceRequest(payload),
  });

export const useUpdateInvoiceMutation = () =>
  useMutation({
    mutationFn: ({
      invoiceId,
      payload,
    }: {
      invoiceId: number;
      payload: UpdateFacturaDto;
    }) => updateInvoiceRequest(invoiceId, payload),
  });

export const useDeleteInvoiceMutation = () =>
  useMutation({
    mutationFn: (invoiceId: number) => deleteInvoiceRequest(invoiceId),
  });

export const useProductsQuery = () =>
  useQuery<ProductCatalogItem[]>({
    queryKey: ["productos"],
    queryFn: getProductsRequest,
  });
