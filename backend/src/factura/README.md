# Invoice Module

## Description

This module manages manual and OCR-assisted invoice flows, invoice listing and stats, custom/shared date filtering, image uploads, and currency normalization.

## Responsibilities

- Create, update, list, and delete invoices scoped to the authenticated user.
- Process invoice images with the OCR pipeline and persist OCR metadata such as `ocrSource`.
- Validate invoice items, totals, and currency fields before persistence.
- Calculate stats and support the shared `week | month | year | all | custom` filtering contract.

## Key Files

- `factura.controller.ts`: Protected invoice endpoints for CRUD, stats, OCR upload, and OCR-based creation.
- `factura.service.ts`: Main invoice use cases, pagination, stats, exchange-rate resolution, and storage integration.
- `factura.domain.ts`: Business rules for totals, discount handling, quantity validation, and OCR normalization.
- `dto/get-facturas-query.dto.ts`: Shared invoice filter query contract with `period`, `startDate`, `endDate`, `page`, and `limit`.
- `factura-ocr.service.ts`: Upload-to-parse workflow that combines OCR and AI extraction strategies.
- `prisma-factura.repository.ts`: User-scoped persistence implementation for lists, detail views, counts, and totals.

## How it Works

- Manual flows validate the payload, optionally store the invoice image, resolve currency information, and persist invoice/product snapshots in one transaction.
- OCR flows accept an image, parse the detected items, normalize duplicates, and then create the invoice with the original file and OCR source metadata.
- Listing and stats reuse the shared period system, including explicit `all` support and `custom` ranges normalized to UTC day boundaries.
- Quantity validation now allows decimal values only when the item unit is `kg`; other units must remain whole-number quantities.

## Integration

- Depends on `producto` to resolve catalog items, create missing OCR-discovered products, and keep invoice items user-scoped.
- Uses `infra/storage` for image persistence and `infra/exchange-rate` for automatic rate lookup when the invoice currency differs from the user's base currency.
- Feeds `reportes` with normalized invoice data and is consumed by frontend invoice, dashboard, and reports features through the shared filtering contract.

## Notes

- `custom` filters require both `startDate` and `endDate` in `YYYY-MM-DD` format.
- Stats are cached per user and filter window, including custom-range cache keys.
