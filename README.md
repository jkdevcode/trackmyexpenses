# TrackMyExpenses

TrackMyExpenses is a full-stack expense management platform built as a monorepo with a React frontend and a NestJS backend. The application combines secure authentication, OCR-assisted invoice capture, multi-currency expense tracking, shared date filters, PDF reporting, and a Docker-ready local environment in a single workflow.

## CI Status

[![Backend CI](https://github.com/jkdevcode/trackmyexpenses/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/jkdevcode/trackmyexpenses/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/jkdevcode/trackmyexpenses/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/jkdevcode/trackmyexpenses/actions/workflows/frontend-ci.yml)

## Features

- Secure authentication with register, login, logout, protected routes, and password recovery via email reset links.
- Invoice workflows for manual entry and OCR-assisted capture, including product snapshots and quantity validation that only allows decimal quantities for `kg` items.
- Shared filtering across dashboard, invoices, and reports with `week`, `month`, `year`, `all`, and `custom` date ranges.
- Dashboard analytics and PDF reports with availability checks before download.
- Multi-currency invoices with exchange-rate support and normalized totals in the user's base currency.
- Localized public pages, legal pages, cookie consent messaging, and contact metadata for the frontend experience.
- Dockerized frontend, backend, and MySQL services for local smoke tests and container-based deployment workflows.

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, TanStack Query, React Hook Form, Yup, HeroUI, i18next, Playwright |
| Backend | NestJS 11, Prisma, MySQL, Zod, JWT cookie auth, Nodemailer, Puppeteer, Tesseract.js |
| Integrations | Gemini OCR assistance, Exchange Rate API, Redis cache (optional), Sentry (frontend, optional), SMTP |
| DevOps | Docker, Docker Compose, Nginx, GitHub Actions, GHCR |

## Project Structure

- `frontend/`: React SPA with feature-based modules for auth, dashboard, invoices, reports, settings, landing, and legal pages.
- `backend/`: NestJS REST API under `/api` with Prisma, Swagger, auth, invoices, OCR, reporting, and infrastructure modules.
- `.github/workflows/`: CI/CD workflows for backend, frontend, Docker smoke tests, and staging delivery.
- `changes_summary.txt`, `commits.txt`, `files.txt`: Change-tracking files used to align the docs with the latest merged work.

## Getting Started

1. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`.
2. Install dependencies in each app:
   - `cd backend && npm install`
   - `cd frontend && npm install`
3. Start MySQL locally. You can use your own server or run only the database container from the repo root:
   - `docker compose up -d mysql`
4. Prepare the database from `backend/`:
   - `npx prisma migrate dev`
5. Start the backend:
   - `npm run start:dev`
6. Start the frontend from `frontend/`:
   - `npm run dev`
7. Open the app at `http://localhost:5173` and Swagger at `http://localhost:3000/docs`.

## Docker Compose

1. Copy the root `.env.example` to `.env` and `backend/.env.example` to `backend/.env`.
2. Review the root compose values, especially `MYSQL_ROOT_PASSWORD`, `VITE_API_URL`, `VITE_ASSETS_URL`, and `FRONTEND_PORT`.
3. Start the full stack from the repository root:
   - `docker compose up --build -d`
4. Open:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000/api`
   - Swagger: `http://localhost:3000/docs`
5. Health checks are exposed at:
   - Frontend: `http://localhost:5173/healthz`
   - Backend: `http://localhost:3000/api/health`

Notes:

- The frontend container serves the Vite build through Nginx.
- The backend container runs `docker-entrypoint.sh`, generates the Prisma client, and applies `prisma migrate deploy` when `PRISMA_MIGRATE_DEPLOY=true`.
- Inside the Docker Compose network, the backend connects to MySQL with the host `mysql`. Local host-machine processes should keep using `localhost`.

## Delivery and Tooling

- GitHub Actions validate backend tests, frontend build/E2E, Docker image builds, and a Docker Compose smoke test.
- A manual CD workflow builds and pushes the backend image to GHCR and can trigger a staging rollout over SSH.
- A Postman collection for the API lives in `backend/docs/postman/trackmyexpenses.postman_collection.json`.

## Documentation

- [`backend/README.md`](./backend/README.md): API capabilities, auth flow, SMTP setup, Swagger, and backend environment variables.
- [`frontend/README.md`](./frontend/README.md): frontend routes, auth/report flows, shared filters, state management, and frontend environment variables.
- [`.github/workflows/README.md`](./.github/workflows/README.md): CI/CD workflow responsibilities, Docker smoke tests, and staging deployment notes.
- [`backend/docs/postman/README.md`](./backend/docs/postman/README.md): how to use the shared Postman collection.
