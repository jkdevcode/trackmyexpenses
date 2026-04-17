# Prisma Migrations

## Description

This folder contains the committed Prisma migration history for the backend database.

## Responsibilities

- Store the SQL generated for each schema change.
- Preserve the ordered migration history used by local development, Dockerized runtime startup, and deployed environments.
- Make database evolution reviewable alongside application code.

## Key Files

- `20260318234521_enforce_currency_and_snapshot_not_null/migration.sql`: Aligns current currency-related columns with the application schema.
- `20260403002749_init_clean/migration.sql`: Adds the invoice OCR metadata columns used by the current invoice workflow.

## How it Works

- Each timestamped folder represents one Prisma migration and contains the SQL to move the database from one schema version to the next.
- Local development typically creates and applies new migrations through `npx prisma migrate dev`.
- The backend Docker entrypoint can apply committed migrations automatically through `npx prisma migrate deploy` when `PRISMA_MIGRATE_DEPLOY=true`.
- CI uses `prisma db push` for its ephemeral database, but shared and deployed environments still depend on these committed migration folders.

## Integration

- Consumed by Prisma during migration commands run from `backend/`.
- Used by the Docker Compose backend container during startup when migrations are enabled.
- Closely tied to `backend/prisma/schema.prisma` and the backend modules that depend on the resulting tables and columns.

## Notes

- Do not edit previously applied migrations in shared environments; create a new migration instead.
- Keep migration names descriptive enough to show intent during code review and deployment planning.
