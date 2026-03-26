# backend/src

Codigo fuente principal del backend NestJS organizado por modulos de negocio e infraestructura.

## Responsibilities

- Definir bootstrap (`main.ts`) y composicion global (`app.module.ts`).
- Encapsular dominios (`auth`, `user`, `factura`, `producto`, `reportes`).
- Aplicar cross-cutting concerns (`common`, `config`, `infra`, `prisma`).

## Main Files

- **`main.ts`**: Inicializacion de app, Swagger, CORS y middlewares globales.
- **`app.module.ts`**: Registro de modulos, cache, throttling y archivos estaticos bajo `/uploads`.
- **`config/env.validation.ts`**: Validacion tipada de variables de entorno.
- **`common/filters/global-exception.filter.ts`**: Formato unificado de errores.

## Usage

- Base para `npm run start:dev`, `npm run build` y tests.
- `factura`, `producto` y `reportes` comparten Prisma, storage local y servicio de tasas de cambio.
- Referenciado por e2e tests en `backend/test`.
