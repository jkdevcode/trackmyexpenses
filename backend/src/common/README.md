# backend/src/common

Componentes transversales compartidos por todos los modulos del backend.

## Responsibilities

- Estandarizar errores, logging y contexto de request.
- Centralizar filtros/interceptores globales.
- Definir utilidades de validacion de uploads.

## Main Files

- **`filters/global-exception.filter.ts`**: Respuesta de error consistente.
- **`interceptors/request-logging.interceptor.ts`**: Trazas estructuradas por request.
- **`context/request-context.ts`**: Contexto asincrono para `requestId`.
- **`upload/upload-options.ts`**: Limites/MIME para archivos multipart.

## Usage

- Registrado globalmente en `app.module.ts`.
- Reutilizado por controladores (`auth`, `user`, `factura`).
- Reduce duplicacion de infraestructura en modulos de dominio.
