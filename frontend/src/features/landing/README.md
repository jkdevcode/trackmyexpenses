# Landing Feature

## Description

This feature contains the public marketing experience of the product, including localized visuals, navigation, CTAs, and footer links.

## Responsibilities

- Present the product before authentication.
- Surface calls to action for login and registration.
- Link users to legal pages and contact information.
- Serve localized screenshots and feature-copy variants.

## Key Files

- `components/LandingHeader.tsx`: Public navigation and auth entry points.
- `components/HeroSection.tsx`: Main value proposition section.
- `components/FeatureShowcase.tsx` and `HowItWorks.tsx`: Product explanation and feature highlights.
- `components/LandingFooter.tsx`: Legal links and contact email.
- `utils.ts`: Locale-aware landing image selection.

## How it Works

- The landing page reads translations and selects localized hero/dashboard screenshots through `getLandingImages()`.
- The footer routes users to Terms of Service, Privacy Policy, and the configured contact email.
- Public components remain separate from authenticated layout concerns so the marketing surface stays lightweight.

## Integration

- Rendered by `src/pages/landing.tsx` inside `src/layouts/landing.tsx`.
- Uses `APP_CONFIG.contactEmail`, shared UI controls, and locale files under `public/locales`.
- Connects to the legal feature via `/terms-of-service` and `/privacy-policy` routes.

## Notes

- Keep copy and metadata in translation files so English and Spanish stay aligned with the current product messaging.
