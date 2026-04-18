# Frontend Infrastructure Library

## Description

This folder contains shared client-side infrastructure used throughout the SPA.

## Responsibilities

- Configure the shared HTTP client.
- Configure global TanStack Query behavior.
- Initialize optional monitoring services.
- Keep build-time monitoring configuration aligned with Vite and Dockerized frontend builds.

## Key Files

- `axiosClient.ts`: Shared Axios instance with base URL, cookies, and unauthorized interception.
- `queryClient.ts`: Shared TanStack Query client and default query/mutation behavior.
- `sentry.ts`: Lazy Sentry initialization for production builds when a DSN is configured.

## How it Works

- `axiosClient` sends requests with credentials and notifies the session context when a 401 response occurs.
- `queryClient` centralizes retry and cache defaults so feature hooks behave consistently.
- `sentry.ts` defers initialization until the browser is idle and only enables monitoring in production when `VITE_SENTRY_DSN` is present.
- When the frontend is built in Docker, these values are baked into the static bundle through Docker build args passed to Vite.

## Integration

- Used by `src/provider.tsx`, `src/contexts/session-context.tsx`, and all feature service layers.
- Supports dashboard, invoices, auth, reports, and user flows through a single infrastructure surface.

## Notes

- Keep this folder free of presentation logic and feature-specific request shaping.
