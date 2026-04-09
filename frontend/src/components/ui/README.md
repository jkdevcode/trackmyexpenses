# UI Components

## Description

This folder contains domain-agnostic UI controls and wrappers used across the frontend.

## Responsibilities

- Provide reusable controls such as loaders, switches, icons, and consent UI.
- Keep shared interactions accessible and visually consistent.
- Encapsulate small app-wide behaviors that do not belong to a feature module.

## Key Files

- `LoadingSpinner.tsx`: Shared loading indicator used by route suspense boundaries and async views.
- `language-switch.tsx`: Locale switcher with persistence and document `lang`/`dir` updates.
- `theme-switch.tsx`: Toggle for light and dark theme preferences.
- `cookie-consent.tsx`: Consent modal driven by cookie-consent context and `siteConfig()`.
- `icons.tsx`: Shared icon set, including branding and auth-related navigation icons.

## How it Works

- The language switch stores the preferred locale in local storage and keeps the document metadata aligned with the active language.
- The cookie consent component opens only when consent is pending and the config flag enables the flow.
- Shared icons are used across auth pages, the landing page, and the authenticated layout to keep branding and navigation consistent.

## Integration

- Consumed by `src/components/layout`, auth pages, landing pages, and user profile screens.
- Works with `src/contexts`, `src/theme`, and `src/config/site.ts`.
- Supports the recent forgot-password and reset-password pages through shared logo and icon usage.

## Notes

- Keep this folder free of feature-specific API calls or business validation.
