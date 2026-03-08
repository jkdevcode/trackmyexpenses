# Repository Root

Monorepo de TrackMyExpenses con frontend React y backend NestJS para gestion de usuarios, facturas y OCR.

## Responsibilities

- Orquestar los dos proyectos (`backend` y `frontend`).
- Centralizar documentacion de arranque y estructura.
- Exponer scripts/flujo para desarrollo local y CI.

## Main Files

- **`README.md`**: Guia general del repositorio.
- **`develop.ts`**: Script auxiliar local.
- **`backend/`**: API NestJS + Prisma + Swagger.
- **`frontend/`**: SPA React + React Query + i18n.

## Usage

- Instalar dependencias por proyecto (`backend`, `frontend`).
- Ejecutar backend (`npm run start:dev`) y frontend (`npm run dev`) en paralelo.
- Usar `/backend/README.md` para API/Swagger y `/frontend/README.md` para arquitectura cliente.
