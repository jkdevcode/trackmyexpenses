# backend/test

Pruebas e2e del backend ejecutadas con Jest + Supertest.

## Responsibilities

- Validar flujos HTTP completos contra modulos Nest.
- Cubrir autenticacion, usuarios, productos y facturas.
- Verificar contratos de API y comportamiento integrado.

## Main Files

- **`jest-e2e.json`**: Configuracion de suite e2e.
- **`setup-e2e-env.ts`**: Variables de entorno para tests.
- **`auth.e2e-spec.ts`**: Registro/login y errores de credenciales.
- **`factura*.e2e-spec.ts`**: OCR, creacion y relacion factura-producto.

## Usage

- Ejecutar con `npm run test:e2e` o `npm run test:e2e:ci`.
- Requiere DB disponible segun `DATABASE_URL`.
- Se usa en CI backend (`.github/workflows/backend-ci.yml`).
