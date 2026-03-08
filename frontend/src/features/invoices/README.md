# frontend/src/features/invoices

Feature de facturas: OCR, registro manual, listado y detalle.

## Responsibilities

- Subir archivo de factura y validar tipo/tamano en cliente.
- Confirmar parsing OCR y registrar factura en backend.
- Gestionar listado/detalle y formulario manual con productos.

## Main Files

- **`components/OcrInvoiceFlow.tsx`**: Flujo upload -> edicion -> confirmacion.
- **`components/ManualInvoiceForm.tsx`**: Registro manual de factura e items.
- **`hooks/useInvoiceMutations.ts`**: Queries/mutations React Query.
- **`services/invoiceService.ts`**: Requests API tipados de facturas/productos.

## Usage

- Consumido en `src/pages/NewInvoicePage.tsx`.
- Usa `constants/upload.ts` y `hooks/useInvoiceUpload.ts` para validacion.
- Depende de endpoints protegidos del backend (`/api/facturas`, `/api/productos`).
