# Schemas Directory

Validation schemas using Yup, reusable across forms.

## Files

- **`auth.ts`**: Validation for Login and Register forms (email, password rules).
- **`profile.ts`**: Schemas for user profile updates.

## Usage

- Import these schemas in `useFormik` or React Hook Form resolvers.
- Centralizes validation logic to ensure consistency across the app.
- Messages support internationalization keys.
