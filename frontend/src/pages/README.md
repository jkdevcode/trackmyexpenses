# Route Pages

## Description

This folder contains thin route-entry components that assemble features and layouts for top-level navigation.

## Responsibilities

- Provide route-level entry points for the router.
- Keep route files lightweight and delegate business logic to features.
- Compose page metadata, layout wrappers, and feature modules.

## Key Files

- `landing.tsx`: Entry page for the public marketing experience.
- `NewInvoicePage.tsx`: Route entry that switches between OCR, manual, and list invoice tabs.
- `404.tsx`: Fallback page for unknown routes.
- `index.tsx`: Lightweight legacy/default page component.

## How it Works

- Route pages are lazy-loaded by `src/App.tsx` where appropriate.
- `NewInvoicePage.tsx` keeps the invoice tab in the URL and updates page metadata based on the selected tab.
- Most authenticated pages now live directly inside feature folders and are imported from the router.

## Integration

- Depends on `src/features`, `src/layouts`, and shared hooks such as `usePageMeta`.
- Keeps routing concerns separate from feature service and form logic.

## Notes

- Avoid calling backend APIs directly from this folder; use feature services and hooks instead.
