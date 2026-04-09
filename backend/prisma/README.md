# Prisma Schema and Migrations

## Description

This folder defines the MySQL data model for the backend and stores the migration history used to evolve it safely across environments.

## Responsibilities

- Define the persistent shape of users, invoices, products, and invoice item snapshots.
- Track schema changes for password recovery, currency snapshots, user-scoped products, and decimal item quantities.
- Serve as the source of truth for Prisma Client generation and database migrations.

## Key Files

- `schema.prisma`: Main Prisma schema with `Usuario`, `Factura`, `Producto`, and `FacturaProducto`.
- `migrations/20260408170000_add_password_reset_fields/migration.sql`: Adds password reset token and expiration fields to `Usuario`.
- `migrations/20260402190000_factura_producto_decimal_quantity/migration.sql`: Updates invoice item quantity storage to support decimal values.
- `scripts/backfill_currency_snapshot.sql`: Backfill utility for legacy currency snapshot data before stricter constraints are enforced.

## How it Works

- `schema.prisma` defines user auth data, including password reset fields used by the forgot/reset password flow.
- Invoice models store both original and base-currency totals so dashboard and reporting logic can work with normalized monetary data.
- `FacturaProducto.cantidad` is stored as a decimal, which supports the rule that only `kg` items may use decimal quantities.
- Migrations are applied in order to keep the database aligned with the NestJS DTOs, repositories, and services.

## Integration

- `backend/src/prisma` loads this schema through Prisma Client and exposes it to the rest of the app.
- `backend/src/auth` depends on the reset password fields in `Usuario`.
- `backend/src/factura` and `backend/src/reportes` depend on the currency snapshot and item snapshot columns for filtering, totals, and PDFs.

## Notes

- Apply migrations before running backend e2e tests or local development flows that touch auth or invoices.
- Keep DTO validation and service assumptions in sync with schema changes, especially around dates, currency, and item quantity precision.
