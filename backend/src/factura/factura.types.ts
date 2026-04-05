export type PeriodFilter = 'week' | 'month' | 'year' | 'all' | 'custom';

export type CustomPeriodRange = {
  startDate?: string | null;
  endDate?: string | null;
};
