import { PeriodFilter } from './factura.types';

export type FacturaItemInput = {
  productoId: number;
  cantidad: number;
  descuento?: number;
  unidad?: string;
};

export type OcrProductoInput = {
  nombreDetectado?: string;
  cantidadDetectada?: string | number;
  descuentoDetectado?: string | number;
  precioUnitario?: string | number;
  unidadDetectada?: string;
};

export type PeriodWindow = {
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
};

export class FacturaDomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FacturaDomainValidationError';
  }
}

export function assertValidFacturaItems(items: FacturaItemInput[]): void {
  if (!items || items.length === 0) {
    throw new FacturaDomainValidationError(
      'No se permite crear factura sin items',
    );
  }

  const productIds = new Set<number>();

  for (const item of items) {
    if (!Number.isInteger(item.productoId) || item.productoId <= 0) {
      throw new FacturaDomainValidationError('productoId invalido en items');
    }

    if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
      throw new FacturaDomainValidationError('cantidad invalida en items');
    }

    if (
      item.descuento !== undefined &&
      (item.descuento < 0 || item.descuento > 100)
    ) {
      throw new FacturaDomainValidationError(
        'descuento invalido en items (debe estar entre 0 y 100)',
      );
    }

    if (productIds.has(item.productoId)) {
      throw new FacturaDomainValidationError(
        `No se permiten items repetidos del producto ${item.productoId}`,
      );
    }

    productIds.add(item.productoId);
  }
}

export function normalizeAndValidateOcrItem(item: OcrProductoInput): {
  nombreDetectado: string;
  cantidad: number;
  descuento: number;
  precioUnitario: number;
  unidad: string;
} {
  const nombreDetectado = item.nombreDetectado?.trim().toUpperCase();
  const cantidad = Number(item.cantidadDetectada);
  const descuento = Number(item.descuentoDetectado || 0);
  const precioUnitario = Number(item.precioUnitario);

  if (!nombreDetectado) {
    throw new FacturaDomainValidationError(
      'Cada item OCR debe tener nombreDetectado',
    );
  }

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    throw new FacturaDomainValidationError(
      'La cantidad de cada item debe ser > 0',
    );
  }

  if (!Number.isFinite(descuento) || descuento < 0 || descuento > 100) {
    throw new FacturaDomainValidationError(
      'El descuento de cada item debe estar entre 0 y 100',
    );
  }

  return {
    nombreDetectado,
    cantidad,
    descuento,
    precioUnitario,
    unidad: item.unidadDetectada || 'u',
  };
}

export function calculateDiscountedTotal(
  precioUnitario: number,
  cantidad: number,
  descuento = 0,
  roundResult = true,
): number {
  const subtotal = precioUnitario * cantidad;
  const descuentoAplicado = subtotal * (descuento / 100);
  const total = subtotal - descuentoAplicado;
  return roundResult ? roundCurrency(total) : total;
}

export function calculateFacturaTotal(detalleTotales: number[]): number {
  const total = detalleTotales.reduce((acc, value) => acc + value, 0);
  return roundCurrency(total);
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getPeriodWindow(
  period: PeriodFilter,
  now = new Date(),
): PeriodWindow {
  const startDate = new Date(now);
  const endDate = new Date(now);
  const prevStartDate = new Date(now);
  const prevEndDate = new Date(now);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  switch (period) {
    case 'day':
      prevStartDate.setDate(now.getDate() - 1);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setDate(now.getDate() - 1);
      prevEndDate.setHours(23, 59, 59, 999);
      break;
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);

      prevStartDate.setTime(startDate.getTime());
      prevStartDate.setDate(startDate.getDate() - 7);
      prevEndDate.setTime(prevStartDate.getTime());
      prevEndDate.setDate(prevStartDate.getDate() + 6);
      prevEndDate.setHours(23, 59, 59, 999);
      break;
    }
    case 'year':
      startDate.setMonth(0, 1);

      prevStartDate.setFullYear(now.getFullYear() - 1, 0, 1);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setFullYear(now.getFullYear() - 1, 11, 31);
      prevEndDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
    default:
      startDate.setDate(1);

      prevStartDate.setMonth(now.getMonth() - 1, 1);
      prevStartDate.setHours(0, 0, 0, 0);
      prevEndDate.setDate(0);
      prevEndDate.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate, endDate, prevStartDate, prevEndDate };
}

export function calculateSpendingTrend(
  totalSpending: number,
  prevTotalSpending: number,
): number {
  if (prevTotalSpending > 0) {
    const trend =
      ((totalSpending - prevTotalSpending) / prevTotalSpending) * 100;
    return Number(trend.toFixed(1));
  }

  if (totalSpending > 0) {
    return 100;
  }

  return 0;
}
