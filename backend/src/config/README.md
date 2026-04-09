# Backend Configuration

## Description

This folder owns backend startup configuration validation so the NestJS app can fail fast when required environment variables are missing or invalid.

## Responsibilities

- Validate environment variables with typed defaults.
- Enforce production-only requirements such as stronger JWT and CORS configuration.
- Validate conditional dependencies such as complete SMTP settings for password recovery.

## Key Files

- `env.validation.ts`: Zod-based environment schema used by `ConfigModule.forRoot()`.

## How it Works

- The schema parses numeric and boolean env values into the correct runtime types.
- Development-friendly defaults are applied for common values such as `PORT`, `JWT_EXPIRES_IN`, and `CORS_ORIGIN`.
- SMTP settings are validated as a group, so partial email configuration fails validation instead of silently misbehaving.
- Production mode adds stricter checks for `JWT_SECRET`, `CORS_ORIGIN`, and SMTP completeness.

## Integration

- Loaded globally by `ConfigModule` in `app.module.ts`.
- Consumed by auth, mail, exchange rate, storage, health, logging, cache, and throttling services through `ConfigService`.
- Indirectly shapes the frontend password reset flow through `FRONTEND_URL`.

## Notes

- SMTP is optional for local development, but it must be fully configured if password recovery emails are expected to work.
- Any new env var used in runtime code should be added here first to keep startup validation reliable.
