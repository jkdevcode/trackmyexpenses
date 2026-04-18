# Frontend Contexts

## Description

This folder contains global React contexts for session state, theme preferences, accent color, and cookie consent.

## Responsibilities

- Provide authenticated user state across the protected app.
- Persist and expose UI preferences such as theme and accent color.
- Track cookie consent status for public pages.

## Key Files

- `session-context.tsx`: Session hydration, login/logout helpers, and unauthorized handling.
- `theme-context.tsx`: Light/dark theme state and persistence.
- `color-theme.tsx`: Accent-color selection shared across the app.
- `cookie-consent-context.tsx`: Cookie consent state and accept/reject actions.

## How it Works

- The session context calls `/users/me` on startup, stores the authenticated user, and clears local session state when the shared Axios client receives a 401.
- Theme and accent preferences are managed client-side and reused by layout and feature components.
- Cookie consent state controls whether the public consent modal should be rendered.

## Integration

- Mounted together in `src/provider.tsx`.
- Used by auth guards, profile/settings UI, layout components, and public landing/legal screens.
- Session behavior is tightly coupled to the backend's cookie-based auth flow.

## Notes

- Cookie auth is the primary session mechanism; frontend session state mirrors the backend session rather than replacing it.
