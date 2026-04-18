# Theme System

## Description

This folder defines shared visual theme values and accent-color helpers used throughout the frontend.

## Responsibilities

- Declare the supported app accent colors.
- Provide reusable class sets derived from the active accent color.
- Keep theme-related styling decisions centralized.

## Key Files

- `theme.config.ts`: Source of truth for supported HeroUI color values and the default app color.
- `app-color-variants.ts`: Maps the active app color to reusable text, background, border, and navigation classes.

## How it Works

- The color-theme context stores the selected accent color.
- `useAppColorVariants()` translates that selection into consistent utility-class groups used across profile, layout, dashboard, and auth UI.
- `theme.config.ts` also exposes a color map for places where CSS utility classes are not enough.

## Integration

- Used by shared components, layout navigation, profile/settings surfaces, and feature pages that need accent-aware styling.
- Works together with `src/contexts/theme-context.tsx` and `src/contexts/color-theme.tsx`.

## Notes

- Prefer consuming the exported helpers instead of hardcoding color-specific utility classes in feature components.
