# Health Module

## Description

This module exposes runtime health information for the backend so local environments, CI, Docker Compose, and deployment infrastructure can verify readiness.

## Responsibilities

- Check whether the database is reachable through Prisma.
- Check whether the configured uploads directory is writable.
- Return a simple health payload with overall status and individual checks.
- Provide a stable probe target for container and CI smoke tests.

## Key Files

- `health.controller.ts`: Exposes the HTTP health endpoint.
- `health.service.ts`: Runs the database and storage checks and builds the response payload.
- `health.module.ts`: Registers the controller and service.
- `health.service.spec.ts`: Covers degraded and healthy states in unit tests.

## How it Works

- The service runs a lightweight `SELECT 1` query to verify database connectivity.
- It resolves `UPLOADS_DIR`, ensures the directory exists, and checks write access.
- The combined response reports `ok` only when both dependencies pass; otherwise it returns `degraded`.
- Docker Compose uses this endpoint for the backend container health check after startup.

## Integration

- Imported by `AppModule` so the endpoint is available in every environment.
- Depends on `PrismaService` and `ConfigService`.
- Useful for deployment checks, operational dashboards, debugging local startup issues, and the backend CI Docker Compose smoke test.

## Notes

- The health endpoint does not validate SMTP or external exchange-rate availability; it is intentionally limited to core local dependencies.
