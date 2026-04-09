# Shared Hooks

## Description

This folder contains frontend hooks that are reused across multiple features and are not owned by a single domain module.

## Responsibilities

- Encapsulate common React behavior in small reusable hooks.
- Keep global UI helpers out of feature-specific folders.
- Reduce duplication in metadata, debouncing, and preference access.

## Key Files

- `usePageMeta.ts`: Updates document title and meta description with translated defaults.
- `useDebounce.ts`: Reusable debounce helper for search and form interactions.
- `use-theme.ts`: Accessor hook for theme context.
- `use-color-theme.tsx`: Accessor hook for the shared accent-color context.

## How it Works

- `usePageMeta` reads page-level metadata from props and falls back to the `meta` translation namespace when values are not provided.
- `useDebounce` helps smooth UI interactions such as invoice search and other text-driven inputs.
- Theme-related hooks provide simple access to context state without feature modules importing raw contexts directly.

## Integration

- Used by auth, dashboard, invoices, reports, settings, landing, and profile screens.
- Relies on the contexts defined in `src/contexts`.
- Complements feature-level data hooks such as `useAuthMutations` and `useDashboardData`.

## Notes

- Hooks that call domain APIs or encode feature-specific rules should stay inside `src/features/*/hooks`.
