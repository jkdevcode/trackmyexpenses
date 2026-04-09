# Prisma Integration

## Description

This folder integrates Prisma Client into the NestJS application lifecycle and exposes it as a shared dependency.

## Responsibilities

- Create a single Prisma client for the app.
- Manage database connectivity through Nest dependency injection.
- Keep data access consistent across backend modules.

## Key Files

- `prisma.service.ts`: Extends `PrismaClient` and manages connection lifecycle.
- `prisma.module.ts`: Exports `PrismaService` for other modules.

## How it Works

- Nest modules import `PrismaModule` once and inject `PrismaService` where needed.
- The service provides access to the schema defined in `backend/prisma/schema.prisma`.
- Sharing the service prevents duplicated Prisma client instances and keeps tests simpler to wire.

## Integration

- Used by `auth`, `user`, `factura`, `producto`, `reportes`, and `health`.
- Repository classes and service layers build their persistence logic on top of this module.
- E2E tests rely on the same Prisma integration when they boot Nest applications.

## Notes

- Schema changes belong in `backend/prisma`; this folder is the runtime bridge that consumes them.
