# Backend Source

## Description

This directory contains the NestJS application source code, organized into business modules and shared infrastructure layers.

## Responsibilities

- Bootstrap the HTTP server and global middleware stack.
- Compose the domain modules for auth, users, products, invoices, and reports.
- Centralize shared configuration, error handling, logging, and infrastructure adapters.

## Key Files

- `main.ts`: Starts the app, sets the `/api` prefix, configures CORS, cookie parsing, CSRF origin checks, Zod validation, and Swagger.
- `app.module.ts`: Wires global modules such as config, logging, cache, throttling, static uploads, Prisma, and domain modules.
- `common/filters/global-exception.filter.ts`: Normalizes exceptions into the structured API error shape.
- `config/env.validation.ts`: Validates and defaults environment variables before the app finishes booting.

## How it Works

- Requests enter through `main.ts`, which enables cookie-based auth support and Swagger documentation.
- `app.module.ts` registers shared infrastructure once so modules can inject it through Nest dependency injection.
- Domain modules such as `auth`, `factura`, and `user` stay focused on business behavior while `common`, `config`, `infra`, and `prisma` provide reusable foundations.
- Shared period filtering and UTC date normalization live in common utilities and are reused by invoice and report flows.

## Integration

- `backend/test` boots this source tree for e2e coverage.
- The frontend consumes the HTTP API exposed by controllers in these modules.
- Prisma, storage, exchange rate, and mail services are shared across multiple domains from here.

## Notes

- The current filtering contract is `week | month | year | all | custom`, with `custom` relying on validated `YYYY-MM-DD` dates.
- Static uploads are served under `/uploads`, while API routes stay under `/api`.
