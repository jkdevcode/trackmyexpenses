import type { InvoiceDetailItem } from "../types";

import { roundCurrency } from "./currency";

export const getInvoiceItemUnitPrice = (item: InvoiceDetailItem): number => {
  const direct = Number(item.precioUnitario ?? item.producto?.precioUnitario);

  if (Number.isFinite(direct) && direct > 0) {
    return roundCurrency(direct);
  }

  const cantidad = Number(item.cantidad ?? 0);
  const descuento = Number(item.descuento ?? 0);
  const divisor = 1 - descuento / 100;

  if (cantidad > 0 && divisor > 0) {
    return roundCurrency(item.precioTotal / cantidad / divisor);
  }

  return 0;
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
