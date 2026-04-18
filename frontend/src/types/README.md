# Shared Types

## Description

This folder contains lightweight TypeScript types that are shared outside any single frontend feature.

## Responsibilities

- Hold small global contracts that do not belong to one domain module.
- Prevent duplicated utility types across shared components.
- Keep the global type surface intentionally small.

## Key Files

- `index.ts`: Exports shared types such as `IconSvgProps` for reusable SVG-based components.

## How it Works

- Shared UI pieces such as icon components and the language switch import these types to keep prop contracts consistent.
- Feature-specific DTOs and view models remain inside their respective feature folders.

## Integration

- Used by shared UI and component layers.
- Complements feature-local `types.ts` files instead of replacing them.

## Notes

- Add new types here only when they are truly cross-feature; otherwise keep them near the owning feature.
