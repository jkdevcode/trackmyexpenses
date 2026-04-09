# TrackMyExpenses Backend

NestJS API for authentication, invoices, products, users, OCR processing, exchange-rate handling, and PDF reporting. The backend exposes REST endpoints under `/api`, serves Swagger at `/docs`, and uses JWT cookies for authenticated flows.

## API Capabilities

- Authentication: register, login, logout, forgot password, and reset password.
- Session-aware user features via JWT stored in the HttpOnly `token` cookie.
- Invoice management with manual creation, OCR-assisted creation, product snapshots, invoice stats, and shared period filtering.
- Reporting endpoints to validate whether report data exists and to generate invoice PDFs.
- Infrastructure for SMTP delivery, file uploads, optional Redis caching, throttling, exchange-rate lookup, and OCR parsing.

## Authentication Flow

1. `POST /api/auth/login` validates `documento` and `contrasena`, returns the authenticated user, and sets the `token` HttpOnly cookie.
2. Protected endpoints read the JWT from the cookie through the auth guard.
3. `POST /api/auth/forgot-password` accepts an email, stores a hashed reset token with an expiration timestamp, and sends a reset link when SMTP is configured.
4. `POST /api/auth/reset-password` validates the one-time token, updates the password, and clears the stored reset token fields.

Notes:

- The forgot-password response is intentionally generic to avoid leaking whether an email exists.
- Reset links point to `${FRONTEND_URL}/reset-password?token=...`.
- SMTP is optional in local development but required for a working password recovery flow.

## Invoice and Report Filters

- `GET /api/facturas` and `GET /api/facturas/stats` support `period=week|month|year|all|custom`.
- When `period=custom`, both `startDate` and `endDate` must be sent in `YYYY-MM-DD` format.
- `GET /api/reportes/facturas` and `GET /api/reportes/facturas/check` use the same `period` / `startDate` / `endDate` contract.
- Reports still accept legacy `from` and `to` query params for backward compatibility, but new clients should use the shared period filter format.

## Environment Variables

| Variable | Description | Required | Example |
| --- | --- | --- | --- |
| `PORT` | HTTP port used by the NestJS server. | No | `3000` |
| `NODE_ENV` | Runtime mode used for validation and logging defaults. | No | `development` |
| `CORS_ORIGIN` | Allowed origin list for CORS. Comma-separated values are supported. | Yes in production | `http://localhost:5173` |
| `LOG_LEVEL` | Pino log level. | No | `debug` |
| `DATABASE_URL` | Prisma connection string for MySQL. | Yes | `mysql://root:password@localhost:3306/trackmyexpenses` |
| `JWT_SECRET` | Secret used to sign auth tokens. Use a long random value in production. | Yes | `replace-with-a-32-char-secret-value` |
| `JWT_EXPIRES_IN` | JWT lifetime passed to Nest JWT. | No | `7d` |
| `FRONTEND_URL` | Base URL used to build password reset links. | Yes | `http://localhost:5173` |
| `CSRF_ORIGIN_CHECK_ENABLED` | Enables origin checks for unsafe requests that include the auth cookie. | No | `false` |
| `EMAIL_HOST` | SMTP host for password recovery email delivery. | Conditional | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port. `465` enables secure transport, `587` uses STARTTLS. | Conditional | `587` |
| `EMAIL_USER` | SMTP username. | Conditional | `trackmyexpenses@example.com` |
| `EMAIL_PASS` | SMTP password or app password. | Conditional | `app-password-here` |
| `EMAIL_FROM` | Sender displayed in password recovery emails. | Conditional | `TrackMyExpenses <noreply@trackmyexpenses.com>` |
| `GEMINI_API_KEY` | Optional API key for Gemini-assisted OCR/text parsing. | No | `AIzaSyExampleOnlyDoNotUseRealKeys` |
| `EXCHANGE_RATE_API_KEY` | Optional API key for automatic currency conversion. | No | `example-exchange-rate-key` |
| `EXCHANGE_RATE_API_URL` | Base URL for the exchange-rate provider. | No | `https://v6.exchangerate-api.com/v6` |
| `REDIS_URL` | Optional Redis connection string used by the cache module. | No | `redis://localhost:6379` |
| `CACHE_TTL_MS` | Cache TTL in milliseconds for cache-manager entries. | No | `600000` |
| `THROTTLE_LIMIT` | Maximum requests per throttle window. | No | `120` |
| `THROTTLE_TTL` | Throttle window length in seconds. | No | `60` |
| `UPLOADS_DIR` | Local directory used to persist uploaded images. | No | `./uploads/users` |

## Swagger

Run the backend and open `http://localhost:3000/docs`.

- Swagger documents the public auth endpoints and the protected invoice and report endpoints.
- The API uses cookie auth with the `token` cookie. After `POST /api/auth/login`, you can keep using the browser session in Swagger UI.
- For protected endpoints, Swagger also exposes the `cookieAuth` security scheme so you can test the same session-aware requests from the docs.
- Query docs now cover shared period filtering, custom date ranges, and report validation before PDF generation.

## Local Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies: `npm install`.
3. Run migrations: `npx prisma migrate dev`.
4. Start development mode: `npm run start:dev`.

Useful commands:

- `npm run build`
- `npm test`
- `npm run test:e2e`
