# Invoices Feature

## Description

This feature owns the main expense-entry workflow of the product: OCR capture, manual invoice creation, invoice listing, detail/edit flows, and shared invoice filtering utilities.

## Responsibilities

- Support OCR-assisted and manual invoice creation.
- Manage invoice detail, edit, and list views.
- Reuse a single filter model across invoices, dashboard, and reports.
- Handle multi-currency input, exchange-rate display, and quantity validation.

## Key Files

- `ocr/OcrInvoiceFlow.tsx`: Upload, parse, review, and create workflow for invoice images.
- `manual/ManualInvoiceForm.tsx`: Manual entry flow with product selection, date picker, and currency controls.
- `list/InvoiceListView.tsx`: Paginated invoice list with filters, detail modal, and edit modal.
- `hooks/useInvoiceFilters.ts`: Shared filter state for `week | month | year | all | custom`.
- `services/invoiceService.ts`: Typed invoice and product requests.
- `utils/date-periods.ts` and `utils/invoice-filters.ts`: Shared date-range presets and query-param building.
- `utils/invoice-quantity.ts`: Quantity rules that align with the backend's decimal-for-kg constraint.

## How it Works

- The OCR flow uploads the original image, lets the user review parsed items, and creates the invoice through the file-backed OCR endpoint.
- The manual flow uses HeroUI date pickers and currency helpers to build a clean creation payload.
- The list view uses the shared `PeriodFilter` component and custom date-range support to keep invoice filtering aligned with dashboard and reports.
- The current filter contract serializes to `period`, `startDate`, and `endDate`, while `all` explicitly disables date bounding.

## Integration

- Mounted by `src/pages/NewInvoicePage.tsx`, which synchronizes the active invoice tab with the URL.
- Shares filtering helpers with dashboard and reports.
- Depends on backend `/facturas` and `/productos` endpoints plus shared frontend error parsing utilities.

## Notes

- Decimal quantities are only valid for `kg` items; other units should remain whole-number counts.
- `confirmInvoiceRequest` is still present for compatibility, but the primary OCR creation flow uses `/facturas/ocr/create`.
