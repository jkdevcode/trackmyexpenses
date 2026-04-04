export type InvoiceUnit = "u" | "kg" | "g";

export interface ProductSuggestion {
  nombreDetected: string;
  cantidad: number;
  unidad: InvoiceUnit;
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

export type OcrSource = "ai" | "ai-image" | "ocr" | "fallback";

export interface ParsedInvoice {
  empresa?: {
    nombre?: string;
    nit?: string;
  };
  fecha?: string | null;
  moneda?: string | null;
  monedaBase?: string | null;
  tasaCambio?: number | null;
  totalPagar?: number | null;
  totalPagarBase?: number | null;
  monedaDetectada?: string | null;
  productos: ProductSuggestion[];
  totalDetectado?: number | null;
  notes?: string[];
  source?: OcrSource;
}

export interface ScanResponse {
  rawText: string;
  parsed: ParsedInvoice;
  imageRef?: string;
  usedFallbackParser: boolean;
}

/** @deprecated Use CreateInvoiceWithFileDto + createInvoiceWithFileRequest instead */
export interface ConfirmFacturaDto {
  factura: {
    fechaHoraCompra: string;
    metodoPago: PaymentMethod;
    lugarCompra: string;
    nitProveedor?: string;
    totalPagar?: number;
    moneda?: string;
    tasaCambio?: number;
  };
  productos: {
    nombreDetectado: string;
    precioUnitario: number;
    cantidadDetectada: number;
    unidadDetectada?: InvoiceUnit;
    pesoDetectado?: number;
    descuentoDetectado?: number;
  }[];
}

export interface CreateInvoiceWithFileDto {
  factura: {
    fechaHoraCompra: string;
    metodoPago: PaymentMethod;
    lugarCompra: string;
    nitProveedor?: string;
    totalPagar?: number;
    moneda?: string;
    tasaCambio?: number;
  };
  productos: {
    nombreDetectado: string;
    precioUnitario: number;
    cantidadDetectada: number;
    unidadDetectada?: InvoiceUnit;
    descuentoDetectado?: number;
  }[];
  ocrSource?: OcrSource;
  file: File;
}

export interface CreateFacturaDto {
  fechaHoraCompra?: string;
  metodoPago: PaymentMethod;
  lugarCompra: string;
  nitProveedor?: string;
  moneda?: string;
  tasaCambio?: number;
  items: {
    productoId: number;
    cantidad: number;
    unidad?: InvoiceUnit;
    descuento?: number;
  }[];
}

export interface UpdateFacturaDto {
  fechaHoraCompra?: string;
  metodoPago: PaymentMethod;
  lugarCompra: string;
  nitProveedor?: string;
  items?: {
    productoId: number;
    cantidad?: number;
    unidad?: InvoiceUnit;
    descuento?: number;
    precioUnitario?: number;
  }[];
}

export interface ProductCatalogItem {
  id: number;
  codigo?: string;
  nombre: string;
  precioUnitario: number;
}

export type PaymentMethod =
  | "EFECTIVO"
  | "TARJETA_CREDITO"
  | "TARJETA_DEBITO"
  | "TRANSFERENCIA"
  | "OTRO";

export type InvoicePeriod = "day" | "week" | "month" | "year" | "custom";

export type DateRange = {
  startDate: string;
  endDate: string;
};

export interface InvoiceFilter {
  period: InvoicePeriod;
  startDate?: string;
  endDate?: string;
}

export interface InvoiceSummaryItem {
  id: number;
  codigoFactura: string;
  fechaHoraCompra: string;
  lugarCompra: string;
  metodoPago: PaymentMethod;
  totalPagar: number;
  moneda?: string | null;
  monedaBase?: string | null;
  totalPagarBase?: number | null;
}

export interface InvoiceDetailItem {
  id?: number;
  productoId?: number;
  cantidad: number;
  unidad?: InvoiceUnit | null;
  descuento?: number | null;
  precioUnitario?: number | null;
  precioTotal: number;
  productoNombre?: string | null;
  productoCodigo?: string | null;
  producto?: {
    id: number;
    nombre: string;
    precioUnitario: number;
    codigo?: string | null;
  };
}

export interface InvoiceDetail {
  id: number;
  codigoFactura: string;
  metodoPago: PaymentMethod;
  lugarCompra: string;
  nitProveedor?: string | null;
  fechaHoraCompra: string;
  totalPagar: number;
  moneda?: string | null;
  monedaBase?: string | null;
  tasaCambio?: number | null;
  tasaCambioFecha?: string | null;
  tasaCambioFuente?: string | null;
  totalPagarBase?: number | null;
  imagenUrl?: string | null;
  ocrSource?: OcrSource;
  usuario: {
    id: number;
    nombres: string;
    apellidos: string;
  };
  productos: InvoiceDetailItem[];
}
