# Frontend Locale Resources

## Description

This folder contains the static translation files loaded by the frontend at runtime.

## Responsibilities

- Provide parallel translation namespaces for each supported locale.
- Keep shared UI text aligned across public pages, auth, dashboard, invoices, reports, profile, settings, and legal content.
- Store cross-cutting copy such as cookie-consent messaging in a stable location.

## Key Files

- `en-US/common.json`: Shared English labels, navigation text, loading states, and cookie-consent copy.
- `es-ES/common.json`: Shared Spanish labels, navigation text, loading states, and cookie-consent copy.
- `en-US/*.json` and `es-ES/*.json`: Feature-specific namespaces such as `auth`, `dashboard`, `invoices`, `reports`, `legal`, and `validation`.

## How it Works

- i18next loads these JSON files from the public assets directory so translations are available without bundling them directly into feature code.
- Shared UI components use the `common` namespace for labels that span multiple features.
- The cookie-consent modal reads its title, body text, policy label, and action labels from `common.json`, which keeps the public consent UX localized in both supported languages.

## Integration

- Used by shared UI components, public landing pages, auth pages, legal pages, and feature modules through `useTranslation`.
- Works with `frontend/src/config/site.ts`, `frontend/src/components/ui/cookie-consent.tsx`, and the route-level page metadata hooks.
- Supports the public-facing copy rendered in both local development and the Dockerized frontend build.

## Notes

- Keep the namespace structure mirrored between `en-US` and `es-ES`.
- Preserve placeholders and inline markup used by components such as `<Trans>` when editing these files.
