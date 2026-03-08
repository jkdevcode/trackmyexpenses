# backend/src/health

Modulo de health-check para validar estado de dependencias en runtime.

## Responsibilities

- Verificar conectividad con base de datos (Prisma).
- Verificar disponibilidad de escritura en almacenamiento.
- Exponer endpoint de observabilidad para monitoreo.

## Main Files

- **`health.controller.ts`**: Endpoint HTTP de health.
- **`health.service.ts`**: Ejecuta checks de DB y storage.
- **`health.module.ts`**: Registro del modulo.
- **`health.service.spec.ts`**: Pruebas unitarias de degradacion.

## Usage

- Importado por `AppModule`.
- Consumido por pipelines/monitores para readiness.
- Responde estado `ok` o `degraded` con detalle de checks.
