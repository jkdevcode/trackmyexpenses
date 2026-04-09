# TrackMyExpenses Frontend

React SPA built with Vite and TypeScript. The frontend consumes the backend API, keeps authenticated sessions in sync, and renders the landing, auth, dashboard, invoices, reports, profile, settings, and legal experiences.

## User Flows

- Authentication: register, login, forgot password, and reset password.
- Protected app areas: dashboard, invoices, reports, profile, and settings are gated by the session context and route guards.
- Shared filtering: dashboard, invoices, and reports reuse the same period and custom date-range model so users see consistent data windows across the app.
- Reports UI: the reports page checks whether data exists for the selected range before requesting the PDF download.

## Routes

Public routes:

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/terms-of-service`
- `/privacy-policy`

Protected routes:

- `/dashboard`
- `/invoices`
- `/reports`
- `/profile`
- `/settings`

## State Management

- TanStack Query handles server state, request caching, and mutations for auth, dashboard, invoices, products, and reports.
- `SessionProvider` hydrates the current user from `/users/me`, stores the authenticated user in context, and clears local state on unauthorized responses.
- UI preferences such as theme, color theme, and cookie consent are handled with React context providers.
- Forms use React Hook Form plus Yup validation schemas.

## Auth, Filters, and Reports

### Authentication

- Login submits credentials to `/auth/login` and updates the session context after the backend sets the auth cookie.
- Forgot password submits the email to `/auth/forgot-password` and shows a generic success message.
- Reset password reads the `token` query param from `/reset-password?token=...` and sends the new password to `/auth/reset-password`.

### Shared Filters

- The app uses `useInvoiceFilters` as the shared filter state hook.
- Supported periods are `week`, `month`, `year`, `all`, and `custom`.
- Custom ranges are normalized as `YYYY-MM-DD` values and reused by dashboard, invoice list queries, and reports.

### Reports

- The reports page reuses the shared filter UI instead of a separate reporting-only filter form.
- Before generating the PDF, the UI checks `/reportes/facturas/check` so it can warn the user when no invoices exist for the selected range.

## Environment Variables

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `VITE_API_URL` | Base URL for backend API requests. | Yes | `http://localhost:3000/api` |
| `VITE_ASSETS_URL` | Base URL used to resolve uploaded asset URLs. | Yes | `http://localhost:3000` |
| `VITE_SENTRY_DSN` | Optional Sentry DSN for frontend monitoring. | No | `https://examplePublicKey@o0.ingest.sentry.io/0` |
| `VITE_SENTRY_ENVIRONMENT` | Environment label sent to Sentry. | No | `development` |
| `VITE_CONTACT_EMAIL` | Contact email displayed by the app metadata and public pages. | No | `support@trackmyexpenses.dev` |

## Local Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies: `npm install`.
3. Start development mode: `npm run dev`.

Useful commands:

- `npm run build`
- `npm run lint`
- `npm run test:e2e`
