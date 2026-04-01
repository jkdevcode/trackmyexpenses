# backend/src/common

Componentes transversales compartidos por todos los modulos del backend.

## Responsibilities

- Estandarizar errores semanticos, logging y contexto de request.
- Centralizar filtros/interceptores globales y respuestas con `code` + `details`.
- Definir utilidades de validacion de uploads.

## Main Files

- **`errors/app.error.ts`**: Clase base para errores de dominio con detalles por campo.
- **`filters/global-exception.filter.ts`**: Normaliza `AppError` y `HttpException` a una respuesta consistente.
- **`interceptors/request-logging.interceptor.ts`**: Trazas estructuradas por request.
- **`context/request-context.ts`**: Contexto asincrono para `requestId`.
- **`upload/upload-options.ts`**: Limites/MIME para archivos multipart.

## Usage

- Registrado globalmente en `app.module.ts`.
- Reutilizado por controladores y servicios de dominio (`auth`, `user`, `factura`).
- Reduce duplicacion de infraestructura en modulos de dominio.
