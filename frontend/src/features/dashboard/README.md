# Dashboard Feature

## Description

This feature renders the authenticated expense overview, including KPI cards, charts, recent invoices, and the shared date filter used to scope analytics.

## Responsibilities

- Fetch and transform dashboard-ready analytics data.
- Render charts, summary cards, and recent invoice lists.
- Reuse the shared filtering model introduced for invoices and reports.

## Key Files

- `pages/Dashboard.tsx`: Dashboard page composition.
- `hooks/useDashboardData.ts`: Shared filter state, query execution, and toast-based error feedback.
- `components/DateFilter.tsx`: Dashboard wrapper around the shared `PeriodFilter` component.
- `services/dashboardService.ts`: Maps backend invoice and product responses into dashboard view models.
- `components/StatsCards.tsx`, `RevenueChart.tsx`, `AverageTicketChart.tsx`: Core dashboard widgets.

## How it Works

- The dashboard reuses `useInvoiceFilters`, which means analytics now support `week`, `month`, `year`, `all`, and `custom` ranges.
- `dashboardService` builds query params from the shared invoice filter utilities and converts API payloads into chart data and summary metrics.
- Chart aggregation adjusts to the selected filter window, including custom date-range selections.

## Integration

- Consumes invoice filter utilities from the invoices feature.
- Reads server state through TanStack Query and the shared Axios client.
- Works with backend invoice stats and product endpoints to populate cards, charts, and recent activity.

## Notes

- Error feedback is intentionally shown through toasts so the dashboard can stay visible even when a request fails.
