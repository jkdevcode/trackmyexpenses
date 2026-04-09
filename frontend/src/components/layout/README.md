# Layout Components

## Description

This folder contains the authenticated application shell and navigation components used after login.

## Responsibilities

- Render the responsive desktop and mobile navigation experience.
- Expose links to the main protected routes.
- Surface session, theme, language, and logout controls in a shared shell.

## Key Files

- `AppLayout.tsx`: Main protected layout with lazy-loaded sidebar and mobile navbar.
- `Sidebar.tsx`: Desktop navigation with dashboard, invoices, reports, settings, profile, theme, and language controls.
- `MobileNavbar.tsx`: Mobile navigation surface for smaller screens.
- `NavItem.tsx`: Shared navigation item used by the sidebar.
- `LayoutIcons.tsx`: Icon set for the authenticated navigation.

## How it Works

- `AppLayout` renders the navigation shell once and delegates page content through `<Outlet />`.
- The sidebar reads session data for avatar and profile info, uses `VITE_ASSETS_URL` for uploaded images, and links directly to the protected routes.
- Theme and language controls live in the layout so they are available across dashboard, invoices, reports, and settings.

## Integration

- Wrapped by `ProtectedRoute` in `src/App.tsx`.
- Depends on `SessionContext`, theme and color-theme context, and shared UI controls.
- Hosts all private route pages beneath the same shell.

## Notes

- Business-specific page state belongs to the feature modules, not to this layout layer.
