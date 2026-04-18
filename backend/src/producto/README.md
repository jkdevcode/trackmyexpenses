# Product Module

## Description

This module manages the authenticated user's product catalog, which is reused by manual invoice entry and OCR-confirmed invoices.

## Responsibilities

- Create products in the current user's private catalog.
- List catalog products for invoice forms and OCR review flows.
- Enforce user-scoped uniqueness and validation rules.

## Key Files

- `producto.controller.ts`: Protected endpoints for creating and listing products.
- `producto.service.ts`: Product business logic and persistence orchestration.
- `dto/create-producto.dto.ts`: Validation contract for product creation.
- `errors/producto-not-found.error.ts`: Domain error used when a requested product does not exist.

## How it Works

- Product endpoints are protected by JWT auth and always resolve data relative to the authenticated user.
- Manual invoice flows use the catalog directly for product selection.
- OCR flows can resolve an existing product by name or create one before attaching the item snapshot to the invoice.

## Integration

- Imported by `ProductoModule` and consumed heavily by the invoice module.
- Used by the frontend create-product modal and manual invoice forms.
- Relies on Prisma for storage and the shared auth guard for access control.

## Notes

- Product codes are unique per user, not globally across the whole system.
