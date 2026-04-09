# Authentication Module

## Description

This module handles user registration, login, logout, route protection, and password recovery. It is built around JWT authentication stored in the HttpOnly `token` cookie.

## Responsibilities

- Register new users and validate login credentials.
- Issue and clear the auth cookie used by protected backend routes.
- Support forgot-password and reset-password flows with hashed reset tokens.
- Provide guards and decorators for authenticated, role-based, and owner-based access control.

## Key Files

- `auth.controller.ts`: Public auth endpoints for register, login, logout, forgot password, and reset password.
- `auth.service.ts`: Core auth use cases, password hashing, reset token persistence, and email dispatch orchestration.
- `jwt.strategy.ts`: Extracts the JWT from the auth cookie and attaches the authenticated user to the request.
- `utils/password-reset-token.util.ts`: Generates secure raw tokens, hashes them for storage, and defines the reset-token TTL.
- `dto/forgot-password.dto.ts` and `dto/reset-password.dto.ts`: Validation contracts for the password recovery flow.

## How it Works

- Login validates the document number and password, signs a JWT, and returns the session user while setting the `token` cookie.
- Forgot password accepts an email, looks up the user, stores a hashed one-time reset token with expiration, and sends a reset link when SMTP is configured.
- Reset password hashes the incoming token, validates it against the stored hash and expiration, then replaces the password and clears the reset state.
- Guards such as `JwtAuthGuard`, `RolesGuard`, and `SelfOrAdminGuard` are reused by other modules to secure protected resources.

## Integration

- Depends on `PrismaModule` for user persistence, `StorageModule` for optional avatar uploads during registration, and `MailModule` for password recovery delivery.
- Used by `user`, `producto`, `factura`, and `reportes` to secure authenticated endpoints.
- Swagger uses this module's cookie-based auth model for manual testing in `/docs`.

## Notes

- The forgot-password endpoint intentionally returns a generic success message whether or not the email exists.
- Reset links are built from `FRONTEND_URL`, so frontend and backend environments must stay aligned.
