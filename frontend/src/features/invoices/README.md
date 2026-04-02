# frontend/src/features/invoices

Feature de facturas: OCR, registro manual, listado con busqueda/paginacion, detalle y edicion.

## Responsibilities

- Subir imagenes de factura y validar tipo/tamano en cliente.
- Revisar extraccion IA/OCR, conservar el archivo original y confirmar el origen del parseo.
- Gestionar alta manual, creacion rapida de productos, multi-moneda y detalle editable con snapshots.
- Traducir errores estructurados del backend a estados de formulario y feedback visible para el usuario.
- Sincronizar tabs OCR/manual/listado con `tab` en URL y reutilizar busqueda debounced + paginacion en listas y detalle.

## Main Files

- **`ocr/OcrInvoiceFlow.tsx`**: Flujo upload -> edicion -> confirmacion con `ocrSource` y archivo original.
- **`manual/ManualInvoiceForm.tsx`**: Registro manual con productos del usuario, moneda y tasa de cambio.
- **`list/InvoiceListView.tsx`**: Listado con filtro por periodo, busqueda y modales de detalle/edicion.
- **`list/components/InvoiceDetailModal.tsx`**: Visualiza detalle, imagen, moneda, metadata OCR y busqueda paginada de items.
- **`components/PaginatedItems.tsx`**: Paginacion reutilizable para tabla, cards y detalle de productos.
- **`hooks/useInvoiceFilter.ts`**: Busqueda debounced reutilizable para facturas y productos del detalle.
- **`hooks/useInvoiceErrorToast.ts`**: Traduce errores de API y muestra feedback consistente.
- **`services/invoiceService.ts`**: Requests API tipados, incluyendo OCR multipart y consumo del listado de facturas.
- **`utils/invoice-api.ts`**: Mapeos DTO -> modelo para mantener `services/` enfocado en llamadas HTTP.

## Usage

- Consumido principalmente en `src/pages/NewInvoicePage.tsx`, que expone tabs OCR/manual/listado sincronizados con la URL.
- Usa `utils/currency.ts`, `hooks/useInvoiceUpload.ts` y formateadores compartidos para mostrar moneda original y base.
- Depende de endpoints protegidos del backend (`/api/facturas`, `/api/productos`) y del flujo OCR con imagen persistida.
