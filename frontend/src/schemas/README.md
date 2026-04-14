# Validation Schemas

## Description

This folder contains Yup schemas used by React Hook Form to validate frontend forms before requests are sent.

## Responsibilities

- Centralize reusable client-side validation rules.
- Keep validation messages compatible with i18n.
- Stay aligned with backend request contracts and current feature behavior.

## Key Files

- `auth.ts`: Validation for login, register, forgot-password, and reset-password forms.
- `profile.ts`: Validation for profile updates and authenticated password changes.
- `invoice.ts`: Base invoice-form validation for shared invoice metadata fields.

## How it Works

- Feature pages import these schema factories and pass the active translation function so validation messages stay localized.
- Auth validation now includes the new password recovery pages as part of the same schema surface.
- Invoice validation here focuses on common invoice fields, while richer item-level rules are handled closer to the invoice feature logic.

## Integration

- Used by auth, user, and invoice forms through `yupResolver`.
- Works alongside backend Zod validation so the client can fail fast while the server remains authoritative.

## Notes

- Keep schema rules synchronized with backend constraints such as password length and currency-code shape.
