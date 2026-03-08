# backend/prisma

Definicion del modelo de datos y migraciones de base MySQL.

## Responsibilities

- Declarar entidades y relaciones en Prisma Schema.
- Versionar cambios de DB mediante migraciones.
- Servir de fuente para generar Prisma Client.

## Main Files

- **`schema.prisma`**: Modelos `Usuario`, `Factura`, `Producto`, `FacturaProducto`.
- **`migrations/*/migration.sql`**: Historial de cambios de esquema.
- **`migrations/migration_lock.toml`**: Lock de proveedor/migraciones.

## Usage

- Usado por `npx prisma generate` y `prisma db push/migrate`.
- Consumido por `PrismaService` en runtime.
- Debe mantenerse sincronizado con DTOs y logica de servicios.
