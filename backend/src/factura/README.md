# backend/src/factura

Modulo de facturas: CRUD, listado paginado, OCR asistido por IA/OCR y confirmacion de datos extraidos.

## Responsibilities

- Gestionar facturas del usuario autenticado con aislamiento por usuario y listado paginado por periodo.
- Procesar imagenes con flujo image-first (Gemini) y fallback OCR/Tesseract.
- Validar payloads manuales y OCR con errores semanticos por campo antes de persistir.
- Persistir snapshots de items, moneda, tasa de cambio, imagen y origen OCR para calculos posteriores.

## Main Files

- **`factura.controller.ts`**: Endpoints `/facturas` con `period/page/limit`, `/facturas/ocr`, `/facturas/ocr/create`, stats y update/delete.
- **`factura.service.ts`**: Casos de uso manuales y OCR, multi-moneda, metadata de paginacion, storage de imagen y estadisticas.
- **`factura-ocr.service.ts`**: Flujo upload -> parse IA/OCR -> respuesta etiquetada con origen.
- **`factura.domain.ts`**: Validacion/calculo de moneda, descuentos, totales y normalizacion OCR.
- **`errors/factura-error-codes.ts`**: Codigos semanticos usados para validacion y manejo de errores.
- **`prisma-factura.repository.ts`**: Implementacion Prisma con queries user-scoped para listado paginado, detalle y stats.

## Usage

- Importado por `FacturaModule` en `AppModule`.
- Consumido por frontend desde `features/invoices/services/invoiceService.ts` para OCR, alta manual, detalle y listado.
- Depende de `producto` para asociar o crear productos del usuario, de `infra/storage` para `imagenUrl` y de `infra/exchange-rate` para conversion automatica.
