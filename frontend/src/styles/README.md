# Shared Styles

## Description

This folder contains global styling assets and legacy style helpers used by the frontend.

## Responsibilities

- Define global CSS loaded once at startup.
- Hold shared visual helpers that are not tied to a single feature.
- Support the public-facing UI with reusable style resources.

## Key Files

- `globals.css`: Global CSS entry loaded by the app bootstrap.
- `imgs.tsx`: Small legacy image export helper for older styling patterns.

## How it Works

- `globals.css` establishes base styles for the app and supports HeroUI/Tailwind rendering.
- Most landing imagery now lives in `frontend/public/imgs` as localized WebP assets, while this folder remains focused on shared styling concerns.

## Integration

- Loaded by the frontend entrypoint and reused indirectly by all routes.
- Supports public and authenticated views together with `src/theme` and feature-level styling.

## Notes

- Prefer storing product screenshots and localized marketing assets under `public/` rather than expanding `imgs.tsx`.
