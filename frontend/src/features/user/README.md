# User Feature

## Description

This feature manages authenticated account settings tied directly to the current user, including profile data, avatar updates, base currency, and password changes.

## Responsibilities

- Render and submit the profile update form.
- Support authenticated password changes.
- Keep session state in sync after profile edits.
- Surface the impact of base-currency changes to the user.

## Key Files

- `pages/Profile.tsx`: Main profile page with avatar upload and base-currency selection.
- `components/ChangePasswordCard.tsx`: Authenticated password change form.
- `hooks/useUserMutations.ts`: TanStack Query mutations for user updates.
- `services/userService.ts`: Typed requests for profile and password endpoints.

## How it Works

- The profile form is prefilled from session data and updates the session when the backend returns the new user state.
- Avatar uploads are submitted with multipart form data.
- Changing `monedaBase` surfaces a warning because it affects currency conversion and reporting behavior across the app.
- Password changes are handled separately from forgot/reset password flows because they require an active session.

## Integration

- Depends on `SessionContext`, shared schemas, and currency constants.
- Consumes backend `/users/me`, `/users/:id`, and `PATCH /users/change-password` endpoints.
- Shares account and preference concerns with the settings feature.

## Notes

- Base currency changes affect future invoice normalization, dashboard totals, and report outputs.
