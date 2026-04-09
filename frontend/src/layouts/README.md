# Page Layouts

## Description

This folder contains lightweight page-level wrappers that are separate from the authenticated app shell.

## Responsibilities

- Provide reusable outer structure for public or simple pages.
- Keep page wrappers distinct from the main private layout.
- Reduce repeated header/footer composition in route entry files.

## Key Files

- `landing.tsx`: Public layout that wraps pages with the landing header and footer.
- `default.tsx`: Lightweight generic layout used by older or standalone page patterns.

## How it Works

- The landing layout composes the public marketing shell around landing content.
- The default layout remains available for simple pages that need a generic wrapper without the authenticated navigation.

## Integration

- Used by `src/pages/landing.tsx` and any standalone page that does not belong inside `AppLayout`.
- Works alongside shared components and feature-level pages.
- Authenticated routes use `src/components/layout/AppLayout.tsx` instead of these wrappers.

## Notes

- Avoid duplicating sidebar or mobile app-shell logic here; that belongs to the authenticated layout components.
