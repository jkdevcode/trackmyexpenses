# Frontend Features

## Description

This folder contains the feature-oriented architecture of the frontend. Each feature owns its pages, hooks, services, and local types so domain logic stays close to the UI that uses it.

## Responsibilities

- Group domain logic by feature instead of by technical layer only.
- Keep feature APIs, state handling, and view composition easy to trace.
- Reuse shared utilities where multiple features depend on the same behavior.

## Key Files

- `auth/`: Login, register, forgot-password, reset-password, and route-guard flows.
- `dashboard/`: Analytics views and shared-date-filter dashboard data wiring.
- `invoices/`: OCR, manual creation, list/detail/edit flows, and shared filtering utilities.
- `reports/pages/ReportsPage.tsx`: Report generation UI built on the same shared filter model as invoices.
- `landing/`: Public marketing and localized showcase experience.
- `user/`: Profile, avatar, password change, and base-currency management.

## How it Works

- `src/App.tsx` lazy-loads feature pages and combines them with shared route guards and layouts.
- Feature services use `axiosClient` and TanStack Query for server state.
- Dashboard, invoices, and reports now share the same period and custom-range semantics through the invoice filter utilities.
- Public features such as landing and legal stay separate from authenticated product flows.

## Integration

- Depends on `src/components`, `src/contexts`, `src/lib`, and `src/schemas`.
- Auth and user features coordinate with session context, while invoices, dashboard, and reports share filtering primitives.
- All features consume the backend API through the same HTTP client and error parsing strategy.

## Notes

- Prefer shared utilities and shared UI components for cross-feature behavior instead of duplicating logic in multiple features.
