# TrackMyExpenses

TrackMyExpenses is a full-stack expense management platform built as a monorepo with a React frontend and a NestJS backend. The application combines secure authentication, OCR-assisted invoice capture, multi-currency expense tracking, shared date filters, and PDF reporting in a single workflow.

## Features

- Secure authentication with register, login, logout, protected routes, and password recovery via email reset links.
- Invoice workflows for manual entry and OCR-assisted capture, including product snapshots and quantity validation that only allows decimal quantities for `kg` items.
- Shared filtering across dashboard, invoices, and reports with `week`, `month`, `year`, `all`, and `custom` date ranges.
- Dashboard analytics and PDF reports with availability checks before download.
- Multi-currency invoices with exchange-rate support and normalized totals in the user's base currency.
- Localized public pages, legal pages, cookie consent, and contact metadata for the frontend experience.

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, TanStack Query, React Hook Form, Yup, HeroUI, i18next, Playwright |
| Backend | NestJS 11, Prisma, MySQL, Zod, JWT cookie auth, Nodemailer, Puppeteer, Tesseract.js |
| Integrations | Gemini OCR assistance, Exchange Rate API, Redis cache (optional), Sentry (frontend, optional) |

## Project Structure

- `frontend/`: React SPA with feature-based modules for auth, dashboard, invoices, reports, settings, landing, and legal pages.
- `backend/`: NestJS REST API under `/api` with Prisma, Swagger, auth, invoices, OCR, reporting, and infrastructure modules.
- `changes_summary.txt`, `commits.txt`, `files.txt`: Change-tracking files used to align the docs with the latest merged work.

## Getting Started

1. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`.
2. Install dependencies in each app:
   - `cd backend && npm install`
   - `cd frontend && npm install`
3. Prepare the database from `backend/`:
   - `npx prisma migrate dev`
4. Start the backend:
   - `npm run start:dev`
5. Start the frontend from `frontend/`:
   - `npm run dev`
6. Open the app at `http://localhost:5173` and Swagger at `http://localhost:3000/docs`.

## Documentation

- [`backend/README.md`](./backend/README.md): API capabilities, auth flow, SMTP setup, Swagger, and backend environment variables.
- [`frontend/README.md`](./frontend/README.md): frontend routes, auth/report flows, shared filters, state management, and frontend environment variables.
