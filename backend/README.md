# backend
API NestJS del proyecto, responsable de autenticacion, negocio de facturas/productos y acceso a datos.

## Responsibilities
- Exponer endpoints REST bajo prefijo `/api`.
- Gestionar autenticacion con JWT en cookie HttpOnly (`token`).
- Integrar Prisma (MySQL), OCR y parsing de facturas.

## Main Files
- **`src/main.ts`**: Bootstrap, CORS, cookie parser, CSRF check y Swagger.
- **`src/app.module.ts`**: Composicion de modulos y middlewares globales.
- **`prisma/schema.prisma`**: Modelo de datos (`Usuario`, `Factura`, `Producto`).
- **`test/*.e2e-spec.ts`**: Suite e2e de API.

## API Documentation
El backend publica OpenAPI con Swagger UI. Levanta el servidor con `npm install && npm run start:dev` y abre `http://localhost:3000/docs`. Desde Swagger puedes ejecutar endpoints publicos y protegidos; la API usa cookie auth (`token`), por lo que tras `POST /api/auth/login` la cookie queda en el navegador y puedes probar rutas protegidas en la misma sesion. En `Authorize` tambien puedes cargar el esquema cookie `token` manualmente.

## Usage
- Desarrollo: `npm run start:dev`.
- Build/produccion: `npm run build && npm run start:prod`.
- Tests: `npm test` y `npm run test:e2e`.
