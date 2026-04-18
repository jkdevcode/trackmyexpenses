import {
  CustomPeriodRange,
  PeriodFilter,
  PeriodWindow,
} from '../types/periods';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface PeriodResolutionError {
  code: string;
  field?: string;
  meta?: Record<string, unknown>;
}

export type PeriodErrorFactory = (err: PeriodResolutionError) => Error;

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

function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

export function startOfUtcDay(date: Date): Date {
  return buildUtcDate(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

export function endOfUtcDay(date: Date): Date {
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

function parseUtcDateOnly(
  value: string,
  field: 'startDate' | 'endDate',
  errorFactory: PeriodErrorFactory,
): Date {
  if (!DATE_ONLY_PATTERN.test(value)) {
    throw errorFactory({
      code: 'DATE_RANGE_INVALID',
      field,
      meta: { value },
    });
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = buildUtcDate(year, month - 1, day);

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw errorFactory({
      code: 'DATE_RANGE_INVALID',
      field,
      meta: { value },
    });
  }

  return parsedDate;
}

function getCustomPeriodWindow(
  range: CustomPeriodRange | undefined,
  errorFactory: PeriodErrorFactory,
): PeriodWindow {
  const startDateInput = range?.startDate?.trim();
  const endDateInput = range?.endDate?.trim();

  if (!startDateInput || !endDateInput) {
    const missingFields: Array<'startDate' | 'endDate'> = [];
    if (!startDateInput) missingFields.push('startDate');
    if (!endDateInput) missingFields.push('endDate');

    throw errorFactory({
      code: 'DATE_RANGE_REQUIRED',
      meta: { missingFields },
    });
  }

  const startDate = startOfUtcDay(
    parseUtcDateOnly(startDateInput, 'startDate', errorFactory),
  );
  const endDate = endOfUtcDay(
    parseUtcDateOnly(endDateInput, 'endDate', errorFactory),
  );

  if (startDate.getTime() > endDate.getTime()) {
    throw errorFactory({
      code: 'DATE_RANGE_ORDER_INVALID',
      meta: { startDate: startDateInput, endDate: endDateInput },
    });
  }

  const totalDays =
    Math.round(
      (startOfUtcDay(endDate).getTime() - startDate.getTime()) / DAY_IN_MS,
    ) + 1;
  const prevEndDate = endOfUtcDay(addUtcDays(startDate, -1));
  const prevStartDate = startOfUtcDay(addUtcDays(startDate, -totalDays));

  return { startDate, endDate, prevStartDate, prevEndDate };
}

type BoundedPeriodFilter = Exclude<PeriodFilter, 'all'>;

export function getPeriodWindow(
  period: BoundedPeriodFilter,
  now = new Date(),
  range?: CustomPeriodRange,
  errorFactory: PeriodErrorFactory = (err) => new Error(err.code),
): PeriodWindow {
  if (period === 'custom') {
    return getCustomPeriodWindow(range, errorFactory);
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
export function normalizeFacturaDate(value: string | Date): Date {
  const parsedDate = value instanceof Date ? cloneDate(value) : new Date(value);
  return startOfUtcDay(parsedDate);
}
