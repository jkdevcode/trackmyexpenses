# Prisma Schema and Migrations

## Description

This folder defines the MySQL data model for the backend and stores the Prisma migration history used to evolve it safely across local, CI, and Docker Compose environments.

## Responsibilities

- Define the persistent shape of users, invoices, products, and invoice item snapshots.
- Track schema changes for password recovery, OCR metadata, currency handling, and user-scoped product data.
- Serve as the source of truth for Prisma Client generation and database migrations.

## Key Files

- `schema.prisma`: Main Prisma schema with `Usuario`, `Factura`, `Producto`, and `FacturaProducto`.
- `migrations/20260318234521_enforce_currency_and_snapshot_not_null/migration.sql`: Aligns invoice and user currency columns with the current schema expectations.
- `migrations/20260403002749_init_clean/migration.sql`: Adds the `imagenUrl` and `ocrSource` columns used by the invoice OCR workflow.
- `migrations/README.md`: Notes on how migration folders are used across local development, CI, and Dockerized runtime startup.

## How it Works

- `schema.prisma` defines the domain model consumed by Prisma Client at backend startup.
- Migration folders contain the SQL Prisma generated for each schema change, including invoice OCR metadata and currency-alignment changes.
- Local development usually applies migrations with `npx prisma migrate dev`, while the backend Docker entrypoint runs `npx prisma migrate deploy` when `PRISMA_MIGRATE_DEPLOY=true`.
- CI uses `prisma db push` against an ephemeral MySQL service for faster setup, so committed migrations remain the durable source of truth for non-ephemeral environments.

## Integration

- `backend/src/prisma` loads this schema through Prisma Client and exposes it to the rest of the app.
- `backend/src/auth` depends on the user auth fields defined here.
- `backend/src/factura` and `backend/src/reportes` depend on the invoice and snapshot columns for filtering, totals, OCR, and PDF generation.
- `docker-compose.yml` and `backend/docker-entrypoint.sh` rely on these migrations to bring the containerized database into the expected state.

## Notes

- Keep committed migrations in sync with the schema before shipping Docker images or staging deployments.
- Do not edit previously applied migration SQL in shared environments; create a new migration instead.
