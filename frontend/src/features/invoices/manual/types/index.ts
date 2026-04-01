import type { PaymentMethod } from "../../types";

export type { PaymentMethod } from "../../types";

export type ManualInvoiceFormState = {
  fecha: string;
  metodoPago: PaymentMethod;
  lugarCompra: string;
  nitProveedor: string;
  moneda: string;
  tasaCambio: string;
};

export type ManualInvoiceItem = {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  descuento?: number;
  subtotal: number;
};
