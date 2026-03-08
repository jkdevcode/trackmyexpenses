# backend/src/config

Configuracion de entorno y validaciones de arranque del backend.

## Responsibilities

- Validar variables de entorno con Zod.
- Aplicar defaults seguros para desarrollo.
- Fallar temprano ante configuraciones invalidas en produccion.

## Main Files

- **`env.validation.ts`**: Schema de entorno (`PORT`, `JWT_SECRET`, `CORS_ORIGIN`, etc.).

## Usage

- Cargado por `ConfigModule.forRoot()` en `app.module.ts`.
- Garantiza tipos/valores antes de inicializar modulos.
- Referenciado indirectamente por servicios que usan `ConfigService`.
