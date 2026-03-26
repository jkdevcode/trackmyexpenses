# backend/src/infra/storage

Capa de almacenamiento de archivos desacoplada mediante puerto/adaptador.

## Responsibilities

- Definir contrato de storage (`IStorageAdapter`).
- Exponer servicio unificado de upload.
- Resolver implementacion concreta via inyeccion de dependencias y carpetas por dominio.

## Main Files

- **`storage.interface.ts`**: Token DI y contrato del adapter.
- **`storage.service.ts`**: API interna para subir archivos.
- **`storage.module.ts`**: Registro del adapter local.
- **`adapters/local-storage.adapter.ts`**: Escritura en disco local (`uploads`) con subcarpetas.

## Usage

- Llamado desde `AuthService`, `UserService` y `FacturaService` para fotos de perfil e imagenes de facturas.
- Configurable con `UPLOADS_DIR`; el adapter local organiza rutas como `users/` e `invoices/`.
- Puede reemplazarse por adapter S3/GCS sin tocar dominio.
