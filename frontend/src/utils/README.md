# Shared Utilities

## Description

This folder contains small reusable utilities that are not tied to a single feature and do not require React state.

## Responsibilities

- Normalize API error parsing and translation.
- Provide pure helpers for shared UI behavior.
- Reduce duplication in form and request handling code.

## Key Files

- `errors.ts`: Parses backend error payloads, maps codes, and builds field/item error maps.
- `scrollToFirstError.ts`: Moves the viewport to the first invalid form field when needed.

## How it Works

- `errors.ts` understands the backend's structured `{ error: { code, details } }` format and translates it into frontend-friendly messages.
- Field and item error maps are especially useful for invoice forms, where item-level validation needs to point to nested rows.
- These helpers stay framework-light so they can be reused across auth, invoices, profile, and reporting flows.

## Integration

- Used by feature hooks, pages, and form handlers throughout the app.
- Closely aligned with backend `AppError` and the global exception filter.

## Notes

- Keep these helpers pure and deterministic; avoid adding component state or API calls here.
