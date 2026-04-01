import type {
  ConfirmFacturaDto,
  CreateFacturaDto,
  CreateInvoiceWithFileDto,
  InvoiceDetail,
  InvoicePeriod,
  InvoiceSummaryItem,
  ProductCatalogItem,
  ScanResponse,
  UpdateFacturaDto,
} from "../types";
import type {
  CreateProductApiResponse,
  InvoiceDetailApiResponse,
  InvoicesApiResponse,
  ProductsApiResponse,
} from "../utils/invoice-api";

import {
  mapCreateProductResponse,
  mapInvoiceDetailResponse,
  mapInvoicesResponse,
  mapProductsResponse,
} from "../utils/invoice-api";

import axiosClient from "@/lib/axiosClient";

type CreateInvoiceApiResponse = {
  status: number;
  message: string;
};

type UpdateInvoiceApiResponse = {
  status: number;
  message: string;
};

type DeleteInvoiceApiResponse = {
  status: number;
  message: string;
};

export const scanInvoiceRequest = async (file: File): Promise<ScanResponse> => {
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

/**
 * @deprecated The old OCR confirm endpoint (POST /facturas/ocr/confirmar) has been
 * removed. Use createInvoiceWithFileRequest for OCR-confirmed invoices.
 */
export const confirmInvoiceRequest = async (payload: ConfirmFacturaDto) => {
  const response = await axiosClient.post<{ status: number; message: string }>(
    "/facturas/ocr/confirmar",
    payload,
  );

  return response.data;
};

export const createInvoiceWithFileRequest = async (
  dto: CreateInvoiceWithFileDto,
): Promise<{ status: number; message: string }> => {
  const formData = new FormData();

  formData.append("fechaHoraCompra", dto.factura.fechaHoraCompra);
  formData.append("metodoPago", dto.factura.metodoPago);
  formData.append("lugarCompra", dto.factura.lugarCompra);

  if (dto.factura.nitProveedor) {
    formData.append("nitProveedor", dto.factura.nitProveedor);
  }

  if (dto.factura.totalPagar !== undefined) {
    formData.append("totalPagar", String(dto.factura.totalPagar));
  }

  if (dto.factura.moneda) {
    formData.append("moneda", dto.factura.moneda);
  }

  if (dto.factura.tasaCambio !== undefined) {
    formData.append("tasaCambio", String(dto.factura.tasaCambio));
  }

  formData.append("items", JSON.stringify(dto.productos));

  if (dto.ocrSource) {
    formData.append("ocrSource", dto.ocrSource);
  }

  formData.append("file", dto.file);

  const response = await axiosClient.post<{ status: number; message: string }>(
    "/facturas/ocr/create",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
};

export const createInvoiceRequest = async (payload: CreateFacturaDto) => {
  const response = await axiosClient.post<CreateInvoiceApiResponse>(
    "/facturas",
    payload,
  );

  return response.data;
};

export const updateInvoiceRequest = async (
  invoiceId: number,
  payload: UpdateFacturaDto,
) => {
  const response = await axiosClient.put<UpdateInvoiceApiResponse>(
    `/facturas/${invoiceId}`,
    payload,
  );

  return response.data;
};

export const deleteInvoiceRequest = async (invoiceId: number) => {
  const response = await axiosClient.delete<DeleteInvoiceApiResponse>(
    `/facturas/${invoiceId}`,
  );

  return response.data;
};

export const getProductsRequest = async (): Promise<ProductCatalogItem[]> => {
  const response = await axiosClient.get<ProductsApiResponse>("/productos");

  return mapProductsResponse(response.data);
};

export const createProductRequest = async (payload: {
  codigo: string;
  nombre: string;
  precioUnitario: number;
}): Promise<ProductCatalogItem> => {
  const response = await axiosClient.post<CreateProductApiResponse>(
    "/productos",
    payload,
  );

  return mapCreateProductResponse(response.data, payload);
};

export const getInvoicesRequest = async (
  period: InvoicePeriod,
): Promise<InvoiceSummaryItem[]> => {
  const response = await axiosClient.get<InvoicesApiResponse>(
    `/facturas?period=${period}`,
  );

  return mapInvoicesResponse(response.data);
};

export const getInvoiceDetailRequest = async (
  invoiceId: number,
): Promise<InvoiceDetail> => {
  const response = await axiosClient.get<InvoiceDetailApiResponse>(
    `/facturas/${invoiceId}`,
  );

  return mapInvoiceDetailResponse(response.data);
};
