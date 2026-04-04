export type PeriodFilter = 'day' | 'week' | 'month' | 'year' | 'custom';

export type CustomPeriodRange = {
  startDate?: string | null;
  endDate?: string | null;
};
