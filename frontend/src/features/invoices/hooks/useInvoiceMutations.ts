import type {
  ConfirmFacturaDto,
  CreateFacturaDto,
  ProductCatalogItem,
} from "../types";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  confirmInvoiceRequest,
  createInvoiceRequest,
  getProductsRequest,
  scanInvoiceRequest,
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

export const useProductsQuery = () =>
  useQuery<ProductCatalogItem[]>({
    queryKey: ["productos"],
    queryFn: getProductsRequest,
  });
