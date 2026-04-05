export type PeriodFilter = 'week' | 'month' | 'year' | 'all' | 'custom';

export type CustomPeriodRange = {
  startDate?: string | null;
  endDate?: string | null;
};

export type PeriodWindow = {
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
};
