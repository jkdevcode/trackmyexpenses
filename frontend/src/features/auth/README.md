# Auth Feature

## Description

This feature owns the frontend authentication experience, including public auth pages, route guards, and password recovery flows.

## Responsibilities

- Render login, registration, forgot-password, and reset-password pages.
- Execute auth mutations and coordinate successful login with session context.
- Gate public-only and protected routes.

## Key Files

- `pages/Login.tsx`: Sign-in UI that updates the session after a successful login.
- `pages/Register.tsx`: Registration form with optional avatar upload and base-currency selection.
- `pages/ForgotPassword.tsx`: Email submission flow for requesting a reset link.
- `pages/ResetPassword.tsx`: Token-based password reset page.
- `hooks/useAuthMutations.ts`: TanStack Query mutations for auth requests.
- `services/authService.ts`: Typed auth requests and DTO shaping.

## How it Works

- Login and registration submit directly to the backend auth endpoints and rely on the backend to set the auth cookie.
- Forgot password shows a success toast and confirmation state without revealing whether the email exists.
- Reset password reads the `token` query parameter from the URL and submits the new password through the reset endpoint.
- `ProtectedRoute` and `PublicOnlyRoute` decide navigation based on the shared session context.

## Integration

- Uses `SessionContext` to store the authenticated user in memory.
- Mounted from `src/App.tsx` as public routes alongside the landing and legal pages.
- Validated with `src/schemas/auth.ts` and backed by backend auth/password recovery endpoints.

## Notes

- Password recovery is intentionally split into two pages so email request and token validation stay independent.
