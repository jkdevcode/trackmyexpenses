# Repository Root

Monorepo de TrackMyExpenses con frontend React y backend NestJS para gestion de usuarios, facturas, OCR, multi-moneda y reportes PDF.

## Responsibilities

- Orquestar los dos proyectos (`backend` y `frontend`).
- Centralizar documentacion de arranque, estructura y features compartidas.
- Exponer scripts y flujo base para desarrollo local y CI.

## Main Files

- **`README.md`**: Guia general del repositorio.
- **`develop.ts`**: Script auxiliar local.
- **`backend/`**: API NestJS + Prisma + OCR + reportes PDF.
- **`frontend/`**: SPA React + React Query + i18n + flujo de facturas/reportes.

## Usage

- Instalar dependencias por proyecto (`backend`, `frontend`).
- Ejecutar backend (`npm run start:dev`) y frontend (`npm run dev`) en paralelo.
- Usar `/backend/README.md` para API, OCR, moneda y reportes; `/frontend/README.md` para arquitectura cliente y rutas.
