import { Prisma } from '@prisma/client';
import { CustomPeriodRange, PeriodFilter, PeriodWindow } from './factura.types';
import { AppError, type AppErrorDetail } from '../common/errors/app.error';
import { FACTURA_ERROR_CODES } from './errors/factura-error-codes';
import {
  getPeriodWindow as getSharedPeriodWindow,
  normalizeFacturaDate as normalizeSharedFacturaDate,
  PeriodResolutionError,
} from '../common/utils/date-periods';

export type FacturaItemInput = {
  productoId: number;
  cantidad: number;
  descuento?: number;
  unidad?: string;
  precioUnitario?: number;
};

export const FACTURA_UNITS = ['u', 'kg', 'g'] as const;
export type FacturaUnidad = (typeof FACTURA_UNITS)[number];

export function normalizeFacturaUnidad(unit?: string | null): FacturaUnidad {
  return FACTURA_UNITS.includes(unit as FacturaUnidad)
    ? (unit as FacturaUnidad)
    : 'u';
}

export function isValidFacturaCantidad(
  cantidad: number,
  unidad?: string | null,
): boolean {
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return false;
  }

  return normalizeFacturaUnidad(unidad) === 'kg'
    ? true
    : Number.isInteger(cantidad);
}

export type OcrProductoInput = {
  nombreDetectado?: string;
  cantidadDetectada?: string | number;
  descuentoDetectado?: string | number;
  precioUnitario?: string | number;
  unidadDetectada?: string;
};

export class FacturaDomainValidationError extends AppError {
  constructor(code: string, details?: AppErrorDetail[]) {
    super(code, code, details);
    this.name = 'FacturaDomainValidationError';
  }
}

/**
 * Normalizes OCR/AI product items by merging duplicates (same name, case-insensitive).
 * Quantities are summed; the first item's price and unit are preserved.
 * Only used in the OCR flow — the manual flow never normalizes.
 */
export function mergeOcrDuplicates(
  items: OcrProductoInput[],
): OcrProductoInput[] {
  const seen = new Map<
    string,
    OcrProductoInput & { cantidadDetectada: number }
  >();

  for (const item of items) {
    const key = (item.nombreDetectado ?? '').trim().toUpperCase();
    if (!key) continue;

    if (seen.has(key)) {
      const existing = seen.get(key)!;
      existing.cantidadDetectada =
        Number(existing.cantidadDetectada) +
        Number(item.cantidadDetectada || 1);
    } else {
      seen.set(key, {
        ...item,
        cantidadDetectada: Number(item.cantidadDetectada || 1),
      });
    }
  }

  return Array.from(seen.values());
}

export function assertValidFacturaItems(items: FacturaItemInput[]): void {
  if (!items || items.length === 0) {
    throw new FacturaDomainValidationError(FACTURA_ERROR_CODES.ITEMS_EMPTY, [
      { code: FACTURA_ERROR_CODES.ITEMS_EMPTY },
    ]);
  }

  const productIds = new Set<number>();

  for (let index = 0; index < items.length; index++) {
    const item = items[index];

    if (!Number.isInteger(item.productoId) || item.productoId <= 0) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.ITEM_PRODUCTO_ID_INVALID,
        [
          {
            field: `items[${index}]`,
            code: FACTURA_ERROR_CODES.ITEM_PRODUCTO_ID_INVALID,
            meta: { index, productoId: item.productoId },
          },
        ],
      );
    }

    if (!isValidFacturaCantidad(item.cantidad, item.unidad)) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.ITEM_CANTIDAD_INVALID,
        [
          {
            field: `items[${index}].cantidad`,
            code: FACTURA_ERROR_CODES.ITEM_CANTIDAD_INVALID,
            meta: {
              index,
              productoId: item.productoId,
              unidad: normalizeFacturaUnidad(item.unidad),
            },
          },
        ],
      );
    }

    if (
      item.descuento !== undefined &&
      (item.descuento < 0 || item.descuento > 100)
    ) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.ITEM_DESCUENTO_INVALID,
        [
          {
            field: `items[${index}].descuento`,
            code: FACTURA_ERROR_CODES.ITEM_DESCUENTO_INVALID,
            meta: { index, productoId: item.productoId },
          },
        ],
      );
    }

    if (
      item.precioUnitario !== undefined &&
      (!Number.isFinite(item.precioUnitario) || item.precioUnitario <= 0)
    ) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.ITEM_PRECIO_INVALID,
        [
          {
            field: `items[${index}].precioUnitario`,
            code: FACTURA_ERROR_CODES.ITEM_PRECIO_INVALID,
            meta: { index, productoId: item.productoId },
          },
        ],
      );
    }

    if (productIds.has(item.productoId)) {
      throw new FacturaDomainValidationError(
        FACTURA_ERROR_CODES.ITEM_DUPLICATE,
        [
          {
            field: `items[${index}]`,
            code: FACTURA_ERROR_CODES.ITEM_DUPLICATE,
            meta: { index, productoId: item.productoId },
          },
        ],
      );
    }

    productIds.add(item.productoId);
  }
}

export function normalizeAndValidateOcrItem(
  item: OcrProductoInput,
  index = 0,
): {
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
  const unidad = normalizeFacturaUnidad(item.unidadDetectada);

  if (!nombreDetectado) {
    throw new FacturaDomainValidationError(
      FACTURA_ERROR_CODES.OCR_ITEM_NAME_MISSING,
      [
        {
          field: `items[${index}]`,
          code: FACTURA_ERROR_CODES.OCR_ITEM_NAME_MISSING,
          meta: { index },
        },
      ],
    );
  }

  if (!isValidFacturaCantidad(cantidad, unidad)) {
    throw new FacturaDomainValidationError(
      FACTURA_ERROR_CODES.OCR_ITEM_CANTIDAD_INVALID,
      [
        {
          field: `items[${index}].cantidad`,
          code: FACTURA_ERROR_CODES.OCR_ITEM_CANTIDAD_INVALID,
          meta: { index, productName: nombreDetectado, unidad },
        },
      ],
    );
  }

  if (!Number.isFinite(descuento) || descuento < 0 || descuento > 100) {
    throw new FacturaDomainValidationError(
      FACTURA_ERROR_CODES.ITEM_DESCUENTO_INVALID,
      [
        {
          field: `items[${index}].descuento`,
          code: FACTURA_ERROR_CODES.ITEM_DESCUENTO_INVALID,
          meta: { index, productName: nombreDetectado },
        },
      ],
    );
  }

  return {
    nombreDetectado,
    cantidad,
    descuento,
    precioUnitario,
    unidad,
  };
}

export function calculateDiscountedTotal(
  precioUnitario: number,
  cantidad: number,
  descuento = 0,
  roundResult = true,
): number {
  const subtotal = new Prisma.Decimal(precioUnitario).mul(cantidad);
  const descuentoAplicado = subtotal.mul(
    new Prisma.Decimal(descuento).div(100),
  );
  const total = subtotal.minus(descuentoAplicado);
  const totalNumber = total.toNumber();
  return roundResult ? roundCurrency(totalNumber) : totalNumber;
}

export function calculateFacturaTotal(detalleTotales: number[]): number {
  let total = new Prisma.Decimal(0);
  for (const value of detalleTotales) {
    if (!Number.isFinite(value)) {
      return Number.NaN;
    }
    total = total.plus(new Prisma.Decimal(value));
  }
  return roundCurrency(total.toNumber());
}

export function roundCurrency(value: number): number {
  return new Prisma.Decimal(value)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
    .toNumber();
}

export function calculateBaseTotal(
  totalPagar: number,
  tasaCambio: number,
): number {
  return roundCurrency(
    new Prisma.Decimal(totalPagar).mul(tasaCambio).toNumber(),
  );
}

export function normalizeCurrencyCode(code: string): string {
  return code.trim().toUpperCase();
}

export function assertValidCurrencyCode(code: string): void {
  if (!/^[A-Z]{3}$/.test(code)) {
    throw new FacturaDomainValidationError(FACTURA_ERROR_CODES.MONEDA_INVALID, [
      { code: FACTURA_ERROR_CODES.MONEDA_INVALID, meta: { code } },
    ]);
  }
}

function facturaPeriodErrorFactory(
  err: PeriodResolutionError,
): FacturaDomainValidationError {
  const code =
    err.code in FACTURA_ERROR_CODES
      ? FACTURA_ERROR_CODES[err.code as keyof typeof FACTURA_ERROR_CODES]
      : err.code;
  const detail: AppErrorDetail = {
    code,
    ...(err.field ? { field: err.field } : {}),
    ...(err.meta ? { meta: err.meta } : {}),
  };

  return new FacturaDomainValidationError(code, [detail]);
}

export function normalizeFacturaDate(value: string | Date): Date {
  return normalizeSharedFacturaDate(value);
}

export function getPeriodWindow(
  period: Exclude<PeriodFilter, 'all'>,
  now = new Date(),
  range?: CustomPeriodRange,
): PeriodWindow {
  return getSharedPeriodWindow(period, now, range, facturaPeriodErrorFactory);
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
