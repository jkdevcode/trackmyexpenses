# backend
API NestJS del proyecto, responsable de autenticacion, negocio de facturas/productos, conversion de moneda y generacion de reportes.

## Responsibilities
- Exponer endpoints REST bajo prefijo `/api`, incluyendo facturas, productos, usuarios y reportes.
- Gestionar autenticacion con JWT en cookie HttpOnly (`token`).
- Integrar Prisma (MySQL), OCR, almacenamiento de imagenes, tasas de cambio y PDF.

## Main Files
- **`src/main.ts`**: Bootstrap, CORS, cookie parser, CSRF check y Swagger.
- **`src/app.module.ts`**: Composicion de modulos, cache/throttling y `ReportesModule`.
- **`prisma/schema.prisma`**: Modelo de datos con moneda base, snapshots e items por usuario.
- **`.env.example`**: Variables base para JWT, Gemini, Exchange Rate API y uploads.

## API Documentation
El backend publica OpenAPI con Swagger UI. Levanta el servidor con `npm install && npm run start:dev` y abre `http://localhost:3000/docs`. Desde Swagger puedes ejecutar endpoints publicos y protegidos; la API usa cookie auth (`token`), por lo que tras `POST /api/auth/login` la cookie queda en el navegador y puedes probar rutas protegidas en la misma sesion. En `Authorize` tambien puedes cargar el esquema cookie `token` manualmente. El modulo de reportes expone `GET /api/reportes/facturas` para descargar PDF por rango de fechas.

## Usage
- Configuracion: copiar `.env.example` a `.env` y completar `JWT_SECRET`; `GEMINI_API_KEY` y `EXCHANGE_RATE_API_KEY` habilitan OCR asistido y conversion automatica.
- Desarrollo: `npm run start:dev`.
- Build/produccion: `npm run build && npm run start:prod`.
- Tests: `npm test` y `npm run test:e2e`.
