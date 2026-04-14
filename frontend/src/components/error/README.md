# Error Components

## Description

This folder contains React render-error handling components used to keep the app resilient when a view crashes.

## Responsibilities

- Catch render-time errors before they break the entire SPA.
- Show safe fallback UI around routes and providers.
- Isolate failures to the smallest practical UI boundary.

## Key Files

- `AppErrorBoundary.tsx`: Reusable error boundary used around lazy routes and the global provider tree.

## How it Works

- The boundary wraps route elements and provider composition so a single component failure does not blank the full app.
- Fallback titles can be customized per route, which helps keep failures understandable in context.

## Integration

- Mounted globally in `src/provider.tsx`.
- Reused in `src/App.tsx` around landing, auth, dashboard, invoices, settings, reports, and legal routes.

## Notes

- This folder handles render failures only; API and validation errors are translated elsewhere through `src/utils/errors.ts`.
