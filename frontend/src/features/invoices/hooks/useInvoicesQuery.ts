import type {
  InvoiceDetail,
  InvoicePeriod,
  InvoiceSummaryItem,
} from "../types";

import { useQuery } from "@tanstack/react-query";

import {
  getInvoiceDetailRequest,
  getInvoicesRequest,
} from "../services/invoiceService";

export const useInvoicesQuery = (period: InvoicePeriod) =>
  useQuery<InvoiceSummaryItem[]>({
    queryKey: ["facturas", period],
    queryFn: () => getInvoicesRequest(period),
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
