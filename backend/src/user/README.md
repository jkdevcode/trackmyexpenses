# User Module

## Description

This module manages authenticated user profile data, account maintenance, and profile-level preferences such as the base currency.

## Responsibilities

- Expose profile endpoints such as `me`, update, change password, and delete.
- Support avatar uploads and profile field updates.
- Enforce self-or-admin authorization rules where appropriate.

## Key Files

- `user.controller.ts`: Protected routes for self-service and admin-aware user access.
- `user.service.ts`: Profile, password-change, and user-deletion business logic.
- `dto/update-user.dto.ts`: Validation contract for profile updates.
- `dto/change-password.dto.ts`: Validation contract for the authenticated password-change flow.

## How it Works

- `/users/me` is the session hydration endpoint used by the frontend on app startup.
- Profile updates accept multipart data so text fields and a new avatar can be saved together.
- Password changes happen through a protected endpoint distinct from the public password reset flow in `auth`.
- Updating `monedaBase` changes how future invoice conversion and reporting behave for that user.

## Integration

- Uses `JwtAuthGuard` for authenticated access and `SelfOrAdminGuard` for id-based routes.
- Depends on `StorageModule` for avatars and `PrismaModule` for persistence.
- Consumed by the frontend `Profile` page, settings flow, and session hydration logic.

## Notes

- The profile password change flow requires an authenticated session; password recovery for signed-out users is handled by the auth module instead.
