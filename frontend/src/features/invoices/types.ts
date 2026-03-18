export interface ProductSuggestion {
  nombreDetected: string;
  cantidad: number;
  unidad: "u" | "kg" | "g";
  precioUnitario: number;
  precioTotal: number;
  productId?: number;
  matchedBy?: string | null;
  matchScore?: number | null;
  confidence?: {
    nombre: number | null;
    cantidad: number | null;
    precio: number | null;
  };
}

export interface ParsedInvoice {
  empresa?: {
    nombre?: string;
    nit?: string;
  };
  fecha?: string | null;
  productos: ProductSuggestion[];
  totalDetectado?: number | null;
  notes?: string[];
}

export interface ScanResponse {
  rawText: string;
  parsed: ParsedInvoice;
  imageRef?: string;
  usedFallbackParser: boolean;
}

export interface ConfirmFacturaDto {
  factura: {
    fechaHoraCompra: string;
    metodoPago: string;
    lugarCompra: string;
    nitProveedor?: string;
    totalPagar?: number;
  };
  productos: {
    nombreDetectado: string;
    precioUnitario: number;
    cantidadDetectada: number;
    unidadDetectada?: string;
    pesoDetectado?: number;
    descuentoDetectado?: number;
  }[];
}

export interface CreateFacturaDto {
  fechaHoraCompra?: string;
  metodoPago: string;
  lugarCompra: string;
  nitProveedor?: string;
  items: {
    productoId: number;
    cantidad: number;
    descuento?: number;
  }[];
}

export interface UpdateFacturaDto {
  fechaHoraCompra?: string;
  metodoPago: string;
  lugarCompra: string;
  nitProveedor?: string;
  items?: {
    productoId: number;
    precioUnitario: number;
  }[];
}

export interface ProductCatalogItem {
  id: number;
  nombre: string;
  precioUnitario: number;
}

export type InvoicePeriod = "day" | "week" | "month" | "year";

export interface InvoiceSummaryItem {
  id: number;
  codigoFactura: string;
  fechaHoraCompra: string;
  lugarCompra: string;
  metodoPago: string;
  totalPagar: number;
}

export interface InvoiceDetailItem {
  cantidad: number;
  unidad?: string | null;
  descuento?: number | null;
  precioTotal: number;
  producto: {
    id: number;
    nombre: string;
    precioUnitario: number;
  };
}

export interface InvoiceDetail {
  id: number;
  codigoFactura: string;
  metodoPago: string;
  lugarCompra: string;
  nitProveedor?: string | null;
  fechaHoraCompra: string;
  totalPagar: number;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  productos: InvoiceDetailItem[];
}
