# Common Backend Utilities

## Description

This folder contains the cross-cutting backend pieces shared by multiple modules, including error contracts, request context, upload validation, and shared date filtering utilities.

## Responsibilities

- Standardize structured API errors and logging behavior.
- Provide reusable utilities for request tracing and file upload validation.
- Centralize shared period and date-range logic used by invoices and reports.

## Key Files

- `errors/app.error.ts`: Base domain error with machine-readable `code` and optional field-level `details`.
- `filters/global-exception.filter.ts`: Converts `AppError`, auth errors, and HTTP exceptions into the unified API response format.
- `interceptors/request-logging.interceptor.ts`: Adds structured request logs and request IDs.
- `utils/date-periods.ts`: Resolves `week`, `month`, `year`, and `custom` ranges with UTC normalization and validation.
- `upload/upload-options.ts`: Shared multipart upload rules for image size, MIME type, and optional file parsing.

## How it Works

- Services throw `AppError` subclasses when they want predictable frontend-facing codes and field metadata.
- The global exception filter maps those errors to a stable JSON shape that the frontend can parse into translated messages.
- The date-period utilities validate `YYYY-MM-DD` input, normalize to UTC day boundaries, and calculate previous windows for stats and trend comparisons.
- Upload helpers enforce consistent file validation across user avatar and invoice image flows.

## Integration

- Registered globally through `AppModule`.
- Used directly by `auth`, `factura`, `user`, and `reportes`.
- Parsed on the frontend by `src/utils/errors.ts` to build field and item-level validation feedback.

## Notes

- Custom date ranges require both `startDate` and `endDate`; missing or invalid values are reported with semantic error codes.
- The `all` period is handled at the module level, while bounded/custom ranges are resolved through the shared utility functions here.
