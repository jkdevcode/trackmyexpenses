# backend/src/infra

Infraestructura tecnica desacoplada de dominio, actualmente enfocada en almacenamiento.

## Responsibilities

- Proveer abstracciones de almacenamiento de archivos.
- Implementar adapters concretos para persistencia de binarios.
- Exponer servicios reutilizables para modulos de negocio.

## Main Files

- **`storage/storage.module.ts`**: Wiring del servicio de storage.
- **`storage/storage.service.ts`**: Fachada para upload de archivos.
- **`storage/storage.interface.ts`**: Puerto/contrato del adapter.
- **`storage/adapters/local-storage.adapter.ts`**: Implementacion local en disco.

## Usage

- Consumido por `auth` y `user` para fotos de perfil.
- Configurado con `UPLOADS_DIR` desde variables de entorno.
- Se sirve publicamente via `ServeStaticModule` en `/uploads`.
