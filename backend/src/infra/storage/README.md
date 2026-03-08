# backend/src/infra/storage

Capa de almacenamiento de archivos desacoplada mediante puerto/adaptador.

## Responsibilities

- Definir contrato de storage (`IStorageAdapter`).
- Exponer servicio unificado de upload.
- Resolver implementacion concreta via inyeccion de dependencias.

## Main Files

- **`storage.interface.ts`**: Token DI y contrato del adapter.
- **`storage.service.ts`**: API interna para subir archivos.
- **`storage.module.ts`**: Registro del adapter local.
- **`adapters/local-storage.adapter.ts`**: Escritura en disco local (`uploads`).

## Usage

- Llamado desde `AuthService` y `UserService` al guardar fotos.
- Configurable con `UPLOADS_DIR`.
- Puede reemplazarse por adapter S3/GCS sin tocar dominio.
