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
