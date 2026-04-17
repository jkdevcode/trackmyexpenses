# UI Components

## Description

This folder contains domain-agnostic UI controls and wrappers used across the frontend.

## Responsibilities

- Provide reusable controls such as loaders, switches, icons, and consent UI.
- Keep shared interactions accessible and visually consistent.
- Encapsulate small app-wide behaviors that do not belong to a feature module.
- Bridge shared UI behavior with locale-driven copy for public-facing components.

## Key Files

- `LoadingSpinner.tsx`: Shared loading indicator used by route suspense boundaries and async views.
- `language-switch.tsx`: Locale switcher with persistence and document `lang`/`dir` updates.
- `theme-switch.tsx`: Toggle for light and dark theme preferences.
- `cookie-consent.tsx`: Consent modal driven by cookie-consent context, `siteConfig()`, and localized strings from `public/locales/*/common.json`.
- `icons.tsx`: Shared icon set, including branding and auth-related navigation icons.

## How it Works

- The language switch stores the preferred locale in local storage and keeps the document metadata aligned with the active language.
- The cookie consent component opens only when consent is pending and the config flag enables the flow.
- Consent copy is translated through i18next, and the body text supports inline markup through `<Trans>`, which keeps the English and Spanish locale files in sync with the rendered modal.
- Shared icons are used across auth pages, the landing page, and the authenticated layout to keep branding and navigation consistent.

## Integration

- Consumed by `src/components/layout`, auth pages, landing pages, legal pages, and user profile screens.
- Works with `src/contexts`, `src/theme`, `src/config/site.ts`, and the locale JSON files under `frontend/public/locales`.
- Supports the auth pages, landing experience, and cookie-consent modal through shared logo, button, and translation-aware UI.

## Notes

- Keep this folder free of feature-specific API calls or business validation.
