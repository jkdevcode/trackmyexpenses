# backend/prisma

Definicion del modelo de datos y migraciones de base MySQL.

## Responsibilities

- Declarar entidades y relaciones para usuarios, productos, facturas y snapshots de items.
- Versionar cambios de DB para multi-moneda, OCR metadata y catalogo de productos por usuario.
- Servir de fuente para generar Prisma Client.

## Main Files

- **`schema.prisma`**: Modelos `Usuario`, `Factura`, `Producto`, `FacturaProducto` con moneda base, snapshots e `ocrSource`.
- **`migrations/*/migration.sql`**: Historial de cambios de esquema, incluyendo multi-moneda y `producto_user_scoped`.
- **`scripts/backfill_currency_snapshot.sql`**: Backfill para facturas legacy antes de endurecer constraints.

## Usage

- Usado por `npx prisma generate` y `prisma migrate`.
- Mantener sincronizado con DTOs y logica de `factura`, `producto`, `user` y `reportes`.
- Ejecutar el backfill de moneda/snapshots antes de aplicar constraints no nulos en entornos con datos previos.
