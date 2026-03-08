# backend/src/factura

Modulo de facturas: CRUD, OCR y confirmacion de datos extraidos.

## Responsibilities

- Gestionar facturas del usuario autenticado.
- Procesar imagenes con OCR y parser de texto/LLM.
- Relacionar facturas con productos y calcular totales.

## Main Files

- **`factura.controller.ts`**: Endpoints `/facturas`, `/facturas/ocr` y confirmacion.
- **`factura.service.ts`**: Casos de uso de creacion/listado/estadisticas.
- **`factura-ocr.service.ts`**: Flujo OCR -> parse -> confirmacion persistida.
- **`prisma-factura.repository.ts`**: Implementacion de repositorio contra Prisma.

## Usage

- Importado por `FacturaModule` en `AppModule`.
- Consumido por frontend desde `features/invoices/services/invoiceService.ts`.
- Depende de `producto` para asociaciones y de `common/upload` para validacion de archivo.
