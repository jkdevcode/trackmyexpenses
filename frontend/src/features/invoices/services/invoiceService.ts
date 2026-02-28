import type {
  ConfirmFacturaDto,
  CreateFacturaDto,
  InvoiceDetail,
  InvoiceSummaryItem,
  InvoicePeriod,
  ProductCatalogItem,
  ScanResponse,
} from "../types";

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

export const createInvoiceRequest = async (payload: CreateFacturaDto) => {
  const response = await axiosClient.post("/facturas", payload);

  return response.data;
};

export const getProductsRequest = async (): Promise<ProductCatalogItem[]> => {
  const response = await axiosClient.get("/productos");
  const rawProducts = response.data?.productos ?? [];

  return rawProducts.map((product: any) => ({
    id: Number(product.id),
    nombre: String(product.nombre ?? ""),
    precioUnitario: Number(product.precioUnitario ?? 0),
  }));
};

export const getInvoicesRequest = async (
  period: InvoicePeriod,
): Promise<InvoiceSummaryItem[]> => {
  const response = await axiosClient.get(`/facturas?period=${period}`);
  const rawInvoices = response.data?.facturas ?? response.data?.data ?? [];

  return rawInvoices.map((invoice: any) => ({
    id: Number(invoice.id),
    codigoFactura: String(invoice.codigoFactura ?? ""),
    fechaHoraCompra: String(invoice.fechaHoraCompra ?? ""),
    lugarCompra: String(invoice.lugarCompra ?? ""),
    metodoPago: String(invoice.metodoPago ?? ""),
    totalPagar: Number(invoice.totalPagar ?? 0),
  }));
};

export const getInvoiceDetailRequest = async (
  invoiceId: number,
): Promise<InvoiceDetail> => {
  const response = await axiosClient.get(`/facturas/${invoiceId}`);
  const raw = response.data?.factura;

  return {
    id: Number(raw?.id ?? 0),
    codigoFactura: String(raw?.codigoFactura ?? ""),
    metodoPago: String(raw?.metodoPago ?? ""),
    lugarCompra: String(raw?.lugarCompra ?? ""),
    nitProveedor: raw?.nitProveedor ? String(raw.nitProveedor) : null,
    fechaHoraCompra: String(raw?.fechaHoraCompra ?? ""),
    totalPagar: Number(raw?.totalPagar ?? 0),
    usuario: {
      id: Number(raw?.usuario?.id ?? 0),
      nombres: String(raw?.usuario?.nombres ?? ""),
      apellidos: String(raw?.usuario?.apellidos ?? ""),
    },
    productos: (raw?.productos ?? []).map((item: any) => ({
      cantidad: Number(item?.cantidad ?? 0),
      unidad: item?.unidad ?? null,
      descuento:
        item?.descuento !== undefined && item?.descuento !== null
          ? Number(item.descuento)
          : null,
      precioTotal: Number(item?.precioTotal ?? 0),
      producto: {
        id: Number(item?.producto?.id ?? 0),
        nombre: String(item?.producto?.nombre ?? ""),
        precioUnitario: Number(item?.producto?.precioUnitario ?? 0),
      },
    })),
  };
};
