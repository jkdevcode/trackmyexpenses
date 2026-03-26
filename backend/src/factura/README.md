# backend/src/factura

Modulo de facturas: CRUD, OCR asistido por IA/OCR y confirmacion de datos extraidos.

## Responsibilities

- Gestionar facturas del usuario autenticado con aislamiento por usuario.
- Procesar imagenes con flujo image-first (Gemini) y fallback OCR/Tesseract.
- Persistir snapshots de items, moneda, tasa de cambio, imagen y origen OCR para calculos posteriores.

## Main Files

- **`factura.controller.ts`**: Endpoints `/facturas`, `/facturas/ocr`, `/facturas/ocr/create`, stats y update/delete.
- **`factura.service.ts`**: Casos de uso manuales y OCR, multi-moneda, storage de imagen y estadisticas.
- **`factura-ocr.service.ts`**: Flujo upload -> parse IA/OCR -> respuesta etiquetada con origen.
- **`factura.domain.ts`**: Validacion/calculo de moneda, descuentos, totales y normalizacion OCR.
- **`prisma-factura.repository.ts`**: Implementacion Prisma con queries user-scoped para detalle y stats.

## Usage

- Importado por `FacturaModule` en `AppModule`.
- Consumido por frontend desde `features/invoices/services/invoiceService.ts`.
- Depende de `producto` para asociar o crear productos del usuario, de `infra/storage` para `imagenUrl` y de `infra/exchange-rate` para conversion automatica.
