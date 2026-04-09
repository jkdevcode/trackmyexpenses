# Frontend Configuration

## Description

This folder contains small runtime and static configuration helpers for the frontend.

## Responsibilities

- Centralize app-wide values that should not be hardcoded in feature files.
- Expose environment-backed settings to the UI.
- Hold lightweight feature flags and shared metadata helpers.

## Key Files

- `app.ts`: Exposes `APP_CONFIG`, including the contact email loaded from `VITE_CONTACT_EMAIL`.
- `site.ts`: Contains the cookie-consent toggle and lightweight site metadata values used by shared UI.

## How it Works

- `APP_CONFIG` is the main place for env-backed frontend configuration currently used by landing and legal surfaces.
- `site.ts` is used by the cookie-consent component to decide whether the consent UI should appear.
- Page-specific titles and descriptions are not defined here; they are resolved through `usePageMeta` and the `meta` translation namespace.

## Integration

- Used by the landing footer, legal pages, and cookie-consent UI.
- Works alongside `import.meta.env` declarations and i18n-based metadata.

## Notes

- Prefer adding user-facing copy to locale files rather than expanding this folder with hardcoded text.
