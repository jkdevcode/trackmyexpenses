import type {
  InvoiceDetail,
  InvoiceSummaryItem,
  OcrSource,
  ProductCatalogItem,
} from "../types";

import { normalizeInvoiceUnit } from "./invoice-quantity";

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
  imagenUrl?: string | null;
  ocrSource?: OcrSource | null;
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

export type ProductsApiResponse = {
  productos?: ApiProductoDto[];
};

export type InvoicesApiResponse = {
  facturas?: ApiFacturaListItemDto[];
  data?: ApiFacturaListItemDto[];
};

export type InvoiceDetailApiResponse = {
  factura?: ApiFacturaDetailDto;
};

export type CreateProductApiResponse = {
  status: number;
  message: string;
  producto?: ApiProductoDto;
};

type CreateProductFallback = Pick<
  ProductCatalogItem,
  "codigo" | "nombre" | "precioUnitario"
>;

const mapProductCatalogItem = (
  product: ApiProductoDto,
): ProductCatalogItem => ({
  id: Number(product.id),
  codigo: product.codigo ? String(product.codigo) : undefined,
  nombre: String(product.nombre ?? ""),
  precioUnitario: Number(product.precioUnitario ?? 0),
});

export const mapProductsResponse = (
  response: ProductsApiResponse,
): ProductCatalogItem[] =>
  (response.productos ?? []).map(mapProductCatalogItem);

export const mapCreateProductResponse = (
  response: CreateProductApiResponse,
  fallback: CreateProductFallback,
): ProductCatalogItem => {
  const product = response.producto;

  if (!product) {
    return {
      id: 0,
      codigo: fallback.codigo,
      nombre: fallback.nombre,
      precioUnitario: fallback.precioUnitario,
    };
  }

  return {
    id: Number(product.id ?? 0),
    codigo: product.codigo ? String(product.codigo) : fallback.codigo,
    nombre: String(product.nombre ?? fallback.nombre),
    precioUnitario: Number(product.precioUnitario ?? fallback.precioUnitario),
  };
};

export const mapInvoicesResponse = (
  response: InvoicesApiResponse,
): InvoiceSummaryItem[] => {
  const rawInvoices = response.facturas ?? response.data ?? [];

  return rawInvoices.map((invoice) => ({
    id: Number(invoice.id),
    codigoFactura: String(invoice.codigoFactura ?? ""),
    fechaHoraCompra: String(invoice.fechaHoraCompra ?? ""),
    lugarCompra: String(invoice.lugarCompra ?? ""),
    metodoPago: invoice.metodoPago as InvoiceSummaryItem["metodoPago"],
    totalPagar: Number(invoice.totalPagar ?? 0),
    moneda: invoice.moneda ? String(invoice.moneda) : null,
    monedaBase: invoice.monedaBase ? String(invoice.monedaBase) : null,
    totalPagarBase:
      invoice.totalPagarBase !== undefined && invoice.totalPagarBase !== null
        ? Number(invoice.totalPagarBase)
        : null,
  }));
};

export const mapInvoiceDetailResponse = (
  response: InvoiceDetailApiResponse,
): InvoiceDetail => {
  const raw = response.factura;

  return {
    id: Number(raw?.id ?? 0),
    codigoFactura: String(raw?.codigoFactura ?? ""),
    metodoPago: (raw?.metodoPago ?? "EFECTIVO") as InvoiceDetail["metodoPago"],
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
    imagenUrl: raw?.imagenUrl ? String(raw.imagenUrl) : null,
    ocrSource: raw?.ocrSource ?? undefined,
    productos: (raw?.productos ?? []).map((item) => ({
      id: item?.id !== undefined ? Number(item.id) : undefined,
      productoId:
        item?.productoId !== undefined && item?.productoId !== null
          ? Number(item.productoId)
          : undefined,
      cantidad: Number(item?.cantidad ?? 0),
      unidad:
        item?.unidad !== undefined && item?.unidad !== null
          ? normalizeInvoiceUnit(String(item.unidad))
          : null,
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
