# frontend/src/features/invoices

Feature de facturas: OCR, registro manual, listado, detalle y edicion.

## Responsibilities

- Subir imagenes de factura y validar tipo/tamano en cliente.
- Revisar extraccion IA/OCR, conservar el archivo original y confirmar el origen del parseo.
- Gestionar alta manual, creacion rapida de productos, multi-moneda y detalle editable con snapshots.

## Main Files

- **`components/OcrInvoiceFlow.tsx`**: Flujo upload -> edicion -> confirmacion con `ocrSource` y archivo original.
- **`components/ManualInvoiceForm.tsx`**: Registro manual con productos del usuario, moneda y tasa de cambio.
- **`components/InvoiceDetailModal.tsx`**: Visualiza detalle, imagen, moneda y metadata OCR de la factura.
- **`components/InvoiceEditModal.tsx`**: Ajuste de items/snapshots persistidos en backend.
- **`hooks/useInvoiceMutations.ts`**: Queries/mutations React Query.
- **`services/invoiceService.ts`**: Requests API tipados, incluyendo multipart para OCR confirmado.

## Usage

- Consumido en `src/pages/NewInvoicePage.tsx`.
- Usa `constants/currency.ts`, `hooks/useInvoiceUpload.ts` y formateadores compartidos para mostrar moneda original y base.
- Depende de endpoints protegidos del backend (`/api/facturas`, `/api/productos`) y del flujo OCR con imagen persistida.
