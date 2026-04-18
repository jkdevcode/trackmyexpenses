import type {
  InvoiceDetail,
  InvoiceFilter,
  InvoiceSummaryItem,
} from "../types";

import { useQuery } from "@tanstack/react-query";

import {
  getInvoiceDetailRequest,
  getInvoicesRequest,
} from "../services/invoiceService";

export const useInvoicesQuery = (filter: InvoiceFilter) =>
  useQuery<InvoiceSummaryItem[]>({
    queryKey: ["facturas", filter],
    queryFn: () => getInvoicesRequest(filter),
    placeholderData: (previousData) => previousData,
  });

export const useInvoiceDetailQuery = (
  invoiceId: number | null,
  enabled = true,
) =>
  useQuery<InvoiceDetail>({
    queryKey: ["factura-detail", invoiceId],
    queryFn: () => getInvoiceDetailRequest(invoiceId as number),
    enabled: enabled && invoiceId !== null,
  });
