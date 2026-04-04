export interface DashboardStats {
  totalInvoices: number;
  totalProducts: number;
  totalSpent: number;
  currentPeriodInvoices: number;
  spendingTrend: number;
}

export interface ExpenseData {
  name: string;
  value: number;
  average?: number;
}

export interface Invoice {
  id: string;
  date: string;
  provider: string;
  total: number;
  itemCount: number;
  status: "processed" | "pending" | "error";
  moneda?: string | null;
  monedaBase?: string | null;
  totalPagarBase?: number | null;
}
