# backend/src/prisma

Integracion de Prisma Client con el ciclo de vida de NestJS.

## Responsibilities

- Crear cliente Prisma compartido para toda la app.
- Conectar a la base al iniciar modulos Nest.
- Exponer modulo reutilizable para inyeccion de dependencias.

## Main Files

- **`prisma.service.ts`**: Extiende `PrismaClient` y gestiona conexion.
- **`prisma.module.ts`**: Exporta `PrismaService` para otros modulos.

## Usage

- Importado por modulos de dominio (`auth`, `user`, `factura`, `producto`, `health`).
- Centraliza acceso a tablas definidas en `backend/prisma/schema.prisma`.
- Evita instancias duplicadas de cliente en controllers/services.
