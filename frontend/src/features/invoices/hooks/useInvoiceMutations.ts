import type {
  CreateFacturaDto,
  CreateInvoiceWithFileDto,
  ProductCatalogItem,
  UpdateFacturaDto,
} from "../types";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  createInvoiceRequest,
  createInvoiceWithFileRequest,
  createProductRequest,
  deleteInvoiceRequest,
  getProductsRequest,
  scanInvoiceRequest,
  updateInvoiceRequest,
} from "../services/invoiceService";

export const useScanInvoiceMutation = () =>
  useMutation({
    mutationFn: (file: File) => scanInvoiceRequest(file),
  });

/**
 * Submits an OCR-confirmed invoice with its original image file to POST /facturas.
 * This replaces the old useConfirmInvoiceMutation (POST /facturas/ocr/confirmar).
 */
export const useCreateInvoiceWithFileMutation = () =>
  useMutation({
    mutationFn: (dto: CreateInvoiceWithFileDto) =>
      createInvoiceWithFileRequest(dto),
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

export const useCreateProductMutation = () =>
  useMutation({
    mutationFn: (payload: {
      codigo: string;
      nombre: string;
      precioUnitario: number;
    }) => createProductRequest(payload),
  });
