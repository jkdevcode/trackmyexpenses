import type { InvoiceDetailItem } from "../types";

const roundCurrency = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export const getInvoiceItemUnitPrice = (item: InvoiceDetailItem): number => {
  const cantidad = Number(item.cantidad ?? 0);
  const descuento = Number(item.descuento ?? 0);
  const divisor = 1 - descuento / 100;

  if (cantidad > 0 && divisor > 0) {
    return roundCurrency(item.precioTotal / cantidad / divisor);
  }

  return Number(item.producto?.precioUnitario ?? 0);
};

export const calculateInvoiceItemTotal = (
  precioUnitario: number,
  cantidad: number,
  descuento = 0,
): number => {
  const subtotal = precioUnitario * cantidad;
  const descuentoAplicado = subtotal * (descuento / 100);

  return roundCurrency(subtotal - descuentoAplicado);
};
