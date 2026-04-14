# Backend E2E Tests

## Description

This folder contains the backend end-to-end test suite built with Jest and Supertest.

## Responsibilities

- Validate HTTP behavior across the main backend modules.
- Catch regressions in authentication, user management, product APIs, and invoice flows.
- Verify that request contracts and protected routes behave correctly when wired through Nest.

## Key Files

- `jest-e2e.json`: Jest configuration for the e2e suite.
- `setup-e2e-env.ts`: Test environment bootstrap values.
- `auth.e2e-spec.ts`: Registration, login, and auth contract coverage.
- `factura.e2e-spec.ts`: OCR and filtered invoice-list coverage, including the explicit `all` period behavior.
- `factura-producto.e2e-spec.ts`: Invoice-product relationship coverage.

## How it Works

- Tests boot lightweight Nest applications and issue real HTTP requests with Supertest.
- The suite focuses on module integration boundaries rather than isolated unit logic.
- Invoice e2e coverage is especially useful for guarding shared filter behavior and request payload compatibility.

## Integration

- Executed locally with `npm run test:e2e` and in CI through `.github/workflows/backend-ci.yml`.
- Depends on the same env validation and Prisma schema assumptions as the main app.
- Complements the unit tests located next to the backend source modules.

## Notes

- Keep the test environment aligned with recent schema and validation changes, especially around password reset fields and invoice filters.
