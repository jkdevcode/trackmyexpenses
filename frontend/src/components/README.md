# Shared Components

## Description

This folder contains reusable presentation components that support multiple frontend features, including the authenticated shell, shared filters, loading states, and render-time error handling.

## Responsibilities

- Provide reusable UI building blocks outside any single feature.
- Keep common layout, loading, error, and filter interactions visually consistent.
- Wrap HeroUI primitives with app-specific behavior and styling.

## Key Files

- `layout/AppLayout.tsx`: Main authenticated shell with sidebar, mobile navigation, and route outlet.
- `filters/PeriodFilter.tsx`: Shared filter control used by dashboard, invoices, and reports.
- `filters/CustomDatePopover.tsx`: Custom range picker used by the shared period filter.
- `error/AppErrorBoundary.tsx`: Render error containment for routes and providers.
- `ui/LoadingSpinner.tsx`: Standard loading state for lazy routes and async views.

## How it Works

- Components in this folder stay presentation-focused and avoid feature-specific API logic.
- The shared period filter is now the main entry point for `week | month | year | all | custom` selection across the app.
- Error and loading components are reused around lazy routes so page transitions and failure states behave consistently.

## Integration

- Used by `src/App.tsx`, feature pages, and route guards.
- Consumed alongside `src/contexts`, `src/theme`, and feature-level hooks.
- Dashboard, invoices, and reports all depend on the shared filter components defined here.

## Notes

- Keep network requests and business rules in feature folders; this folder should stay UI-oriented.
