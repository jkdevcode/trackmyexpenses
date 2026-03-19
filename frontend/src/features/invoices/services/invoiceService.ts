import type {
  ConfirmFacturaDto,
  CreateFacturaDto,
  InvoiceDetail,
  InvoiceSummaryItem,
  InvoicePeriod,
  ProductCatalogItem,
  ScanResponse,
  UpdateFacturaDto,
} from "../types";

import axiosClient from "@/lib/axiosClient";

type ApiProductoDto = {
  id: number | string;
  nombre: string;
  precioUnitario: number | string;
  codigo?: string | null;
};

type ApiFacturaListItemDto = {
  id: number | string;
  codigoFactura: string;
  fechaHoraCompra: string;
  lugarCompra: string;
  metodoPago: string;
  totalPagar: number | string;
  moneda?: string | null;
  monedaBase?: string | null;
  totalPagarBase?: number | string | null;
};

type ApiFacturaDetailDto = {
  id: number | string;
  codigoFactura: string;
  metodoPago: string;
  lugarCompra: string;
  nitProveedor?: string | null;
  fechaHoraCompra: string;
  totalPagar: number | string;
  moneda?: string | null;
  monedaBase?: string | null;
  tasaCambio?: number | string | null;
  tasaCambioFecha?: string | null;
  tasaCambioFuente?: string | null;
  totalPagarBase?: number | string | null;
  usuario?: {
    id: number | string;
    nombres: string;
    apellidos: string;
  };
  productos?: Array<{
    id?: number | string;
    productoId?: number | string;
    cantidad: number | string;
    unidad?: string | null;
    descuento?: number | string | null;
    precioUnitario?: number | string | null;
    precioTotal: number | string;
    productoNombre?: string | null;
    productoCodigo?: string | null;
    producto?: ApiProductoDto;
  }>;
};

type ProductsApiResponse = {
  productos?: ApiProductoDto[];
};

type InvoicesApiResponse = {
  facturas?: ApiFacturaListItemDto[];
  data?: ApiFacturaListItemDto[];
};

type InvoiceDetailApiResponse = {
  factura?: ApiFacturaDetailDto;
};

type ConfirmInvoiceApiResponse = {
  status: number;
  message: string;
};

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

type CreateProductApiResponse = {
  status: number;
  message: string;
  producto?: ApiProductoDto;
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

export const confirmInvoiceRequest = async (payload: ConfirmFacturaDto) => {
  const response = await axiosClient.post<ConfirmInvoiceApiResponse>(
    "/facturas/ocr/confirmar",
    payload,
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
  const rawProducts = response.data?.productos ?? [];

  return rawProducts.map((product) => ({
    id: Number(product.id),
    codigo: product.codigo ? String(product.codigo) : undefined,
    nombre: String(product.nombre ?? ""),
    precioUnitario: Number(product.precioUnitario ?? 0),
  }));
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
  const product = response.data?.producto ?? payload;

  return {
    id: Number((product as ApiProductoDto).id ?? 0),
    codigo: (product as ApiProductoDto).codigo
      ? String((product as ApiProductoDto).codigo)
      : payload.codigo,
    nombre: String((product as ApiProductoDto).nombre ?? payload.nombre),
    precioUnitario: Number(
      (product as ApiProductoDto).precioUnitario ?? payload.precioUnitario,
    ),
  };
};

export const getInvoicesRequest = async (
  period: InvoicePeriod,
): Promise<InvoiceSummaryItem[]> => {
  const response = await axiosClient.get<InvoicesApiResponse>(
    `/facturas?period=${period}`,
  );
  const rawInvoices = response.data?.facturas ?? response.data?.data ?? [];

  return rawInvoices.map((invoice) => ({
    id: Number(invoice.id),
    codigoFactura: String(invoice.codigoFactura ?? ""),
    fechaHoraCompra: String(invoice.fechaHoraCompra ?? ""),
    lugarCompra: String(invoice.lugarCompra ?? ""),
    metodoPago: String(invoice.metodoPago ?? ""),
    totalPagar: Number(invoice.totalPagar ?? 0),
    moneda: invoice.moneda ? String(invoice.moneda) : null,
    monedaBase: invoice.monedaBase ? String(invoice.monedaBase) : null,
    totalPagarBase:
      invoice.totalPagarBase !== undefined && invoice.totalPagarBase !== null
        ? Number(invoice.totalPagarBase)
        : null,
  }));
};

export const getInvoiceDetailRequest = async (
  invoiceId: number,
): Promise<InvoiceDetail> => {
  const response = await axiosClient.get<InvoiceDetailApiResponse>(
    `/facturas/${invoiceId}`,
  );
  const raw = response.data?.factura;

  return {
    id: Number(raw?.id ?? 0),
    codigoFactura: String(raw?.codigoFactura ?? ""),
    metodoPago: String(raw?.metodoPago ?? ""),
    lugarCompra: String(raw?.lugarCompra ?? ""),
    nitProveedor: raw?.nitProveedor ? String(raw.nitProveedor) : null,
    fechaHoraCompra: String(raw?.fechaHoraCompra ?? ""),
    totalPagar: Number(raw?.totalPagar ?? 0),
    moneda: raw?.moneda ? String(raw.moneda) : null,
    monedaBase: raw?.monedaBase ? String(raw.monedaBase) : null,
    tasaCambio:
      raw?.tasaCambio !== undefined && raw?.tasaCambio !== null
        ? Number(raw.tasaCambio)
        : null,
    tasaCambioFecha: raw?.tasaCambioFecha ? String(raw.tasaCambioFecha) : null,
    tasaCambioFuente: raw?.tasaCambioFuente
      ? String(raw.tasaCambioFuente)
      : null,
    totalPagarBase:
      raw?.totalPagarBase !== undefined && raw?.totalPagarBase !== null
        ? Number(raw.totalPagarBase)
        : null,
    usuario: {
      id: Number(raw?.usuario?.id ?? 0),
      nombres: String(raw?.usuario?.nombres ?? ""),
      apellidos: String(raw?.usuario?.apellidos ?? ""),
    },
    productos: (raw?.productos ?? []).map((item) => ({
      id: item?.id !== undefined ? Number(item.id) : undefined,
      productoId:
        item?.productoId !== undefined && item?.productoId !== null
          ? Number(item.productoId)
          : undefined,
      cantidad: Number(item?.cantidad ?? 0),
      unidad: item?.unidad ?? null,
      descuento:
        item?.descuento !== undefined && item?.descuento !== null
          ? Number(item.descuento)
          : null,
      precioUnitario:
        item?.precioUnitario !== undefined && item?.precioUnitario !== null
          ? Number(item.precioUnitario)
          : null,
      precioTotal: Number(item?.precioTotal ?? 0),
      productoNombre: item?.productoNombre ? String(item.productoNombre) : null,
      productoCodigo: item?.productoCodigo ? String(item.productoCodigo) : null,
      producto: item?.producto
        ? {
            id: Number(item.producto.id ?? 0),
            nombre: String(item.producto.nombre ?? ""),
            precioUnitario: Number(item.producto.precioUnitario ?? 0),
            codigo: item.producto.codigo ? String(item.producto.codigo) : null,
          }
        : undefined,
    })),
  };
};
