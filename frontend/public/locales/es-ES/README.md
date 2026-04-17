# Spanish Locale Resources

## Description

This folder contains the Spanish translation namespaces used by the frontend.

## Responsibilities

- Provide the Spanish source text for shared UI and feature pages.
- Keep namespace keys aligned with the English locale so language switching stays predictable.

## Key Files

- `common.json`: Shared labels, navigation text, loading states, and cookie-consent copy.
- `auth.json`, `invoices.json`, `reports.json`, `legal.json`, and related files: Feature-specific Spanish text.

## How it Works

- i18next loads these JSON files by namespace at runtime.
- Shared components such as the cookie-consent modal and landing/footer UI read from `common.json`, while feature pages load their own namespaces.

## Integration

- Used together with `frontend/public/locales/en-US`.
- Consumed by `useTranslation` and `<Trans>` throughout the frontend.

## Notes

- Preserve existing keys and placeholders when editing translations so the React components continue to render correctly.
