import { Prisma } from '@prisma/client';
import { CustomPeriodRange, PeriodFilter } from './factura.types';
import { AppError, type AppErrorDetail } from '../common/errors/app.error';
import { FACTURA_ERROR_CODES } from './errors/factura-error-codes';

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

export type PeriodWindow = {
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

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

function buildUtcDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
): Date {
  return new Date(
    Date.UTC(year, month, day, hours, minutes, seconds, milliseconds),
  );
}

function invalidDateRangeError(
  field: 'startDate' | 'endDate',
  value: string,
): FacturaDomainValidationError {
  return new FacturaDomainValidationError(
    FACTURA_ERROR_CODES.DATE_RANGE_INVALID,
    [
      {
        field,
        code: FACTURA_ERROR_CODES.DATE_RANGE_INVALID,
        meta: { value },
      },
    ],
  );
}

function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

function startOfUtcDay(date: Date): Date {
  return buildUtcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

function endOfUtcDay(date: Date): Date {
  return buildUtcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23,
    59,
    59,
    999,
  );
}

function addUtcDays(date: Date, amount: number): Date {
  const next = cloneDate(date);

  next.setUTCDate(next.getUTCDate() + amount);

  return next;
}

function addUtcMonths(date: Date, amount: number): Date {
  const next = cloneDate(date);

  next.setUTCMonth(next.getUTCMonth() + amount);

  return next;
}

function startOfUtcWeek(date: Date): Date {
  const startDate = startOfUtcDay(date);
  const weekday = startDate.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;

  return addUtcDays(startDate, diff);
}

function endOfUtcWeek(date: Date): Date {
  return endOfUtcDay(addUtcDays(startOfUtcWeek(date), 6));
}

function startOfUtcMonth(date: Date): Date {
  return buildUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function endOfUtcMonth(date: Date): Date {
  return buildUtcDate(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
}

function startOfUtcYear(date: Date): Date {
  return buildUtcDate(date.getUTCFullYear(), 0, 1);
}

function endOfUtcYear(date: Date): Date {
  return buildUtcDate(date.getUTCFullYear(), 11, 31, 23, 59, 59, 999);
}

function parseUtcDateOnly(value: string, field: 'startDate' | 'endDate'): Date {
  if (!DATE_ONLY_PATTERN.test(value)) {
    throw invalidDateRangeError(field, value);
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = buildUtcDate(year, month - 1, day);

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw invalidDateRangeError(field, value);
  }

  return parsedDate;
}

function getCustomPeriodWindow(range?: CustomPeriodRange): PeriodWindow {
  const startDateInput = range?.startDate?.trim();
  const endDateInput = range?.endDate?.trim();

  if (!startDateInput || !endDateInput) {
    const missingFields: Array<'startDate' | 'endDate'> = [];
    if (!startDateInput) missingFields.push('startDate');
    if (!endDateInput) missingFields.push('endDate');

    throw new FacturaDomainValidationError(
      FACTURA_ERROR_CODES.DATE_RANGE_REQUIRED,
      missingFields.map((field) => ({
        field,
        code: FACTURA_ERROR_CODES.DATE_RANGE_REQUIRED,
      })),
    );
  }

  const startDate = startOfUtcDay(
    parseUtcDateOnly(startDateInput, 'startDate'),
  );
  const endDate = endOfUtcDay(parseUtcDateOnly(endDateInput, 'endDate'));

  if (startDate.getTime() > endDate.getTime()) {
    throw new FacturaDomainValidationError(
      FACTURA_ERROR_CODES.DATE_RANGE_ORDER_INVALID,
      [
        {
          field: 'startDate',
          code: FACTURA_ERROR_CODES.DATE_RANGE_ORDER_INVALID,
          meta: { startDate: startDateInput, endDate: endDateInput },
        },
        {
          field: 'endDate',
          code: FACTURA_ERROR_CODES.DATE_RANGE_ORDER_INVALID,
          meta: { startDate: startDateInput, endDate: endDateInput },
        },
      ],
    );
  }

  const totalDays =
    Math.round(
      (startOfUtcDay(endDate).getTime() - startDate.getTime()) / DAY_IN_MS,
    ) + 1;
  const prevEndDate = endOfUtcDay(addUtcDays(startDate, -1));
  const prevStartDate = startOfUtcDay(addUtcDays(startDate, -totalDays));

  return { startDate, endDate, prevStartDate, prevEndDate };
}

export function normalizeFacturaDate(value: string | Date): Date {
  const parsedDate = value instanceof Date ? cloneDate(value) : new Date(value);

  return startOfUtcDay(parsedDate);
}

type BoundedPeriodFilter = Exclude<PeriodFilter, 'all'>;

export function getPeriodWindow(
  period: BoundedPeriodFilter,
  now = new Date(),
  range?: CustomPeriodRange,
): PeriodWindow {
  if (period === 'custom') {
    return getCustomPeriodWindow(range);
  }

  const currentDate = cloneDate(now);

  if (period === 'week') {
    const startDate = startOfUtcWeek(currentDate);
    const endDate = endOfUtcWeek(currentDate);

    return {
      startDate,
      endDate,
      prevStartDate: addUtcDays(startDate, -7),
      prevEndDate: addUtcDays(endDate, -7),
    };
  }

  if (period === 'year') {
    const previousYearDate = buildUtcDate(
      currentDate.getUTCFullYear() - 1,
      0,
      1,
    );

    return {
      startDate: startOfUtcYear(currentDate),
      endDate: endOfUtcYear(currentDate),
      prevStartDate: startOfUtcYear(previousYearDate),
      prevEndDate: endOfUtcYear(previousYearDate),
    };
  }

  const previousMonthDate = addUtcMonths(startOfUtcMonth(currentDate), -1);
  const startDate = startOfUtcMonth(currentDate);
  const endDate = endOfUtcMonth(currentDate);
  const prevStartDate = startOfUtcMonth(previousMonthDate);
  const prevEndDate = endOfUtcMonth(previousMonthDate);

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
