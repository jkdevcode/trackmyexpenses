# GitHub Workflows

## Description

This folder contains the repository automation for continuous integration and manual delivery. The workflows are split by concern so backend and frontend changes can be validated independently, while deployment remains a deliberate manual action.

## Responsibilities

- Run backend quality checks only when backend files change.
- Run frontend quality checks only when frontend files change.
- Build and optionally deploy the backend container image for staging.
- Publish CI artifacts such as coverage summaries and Playwright reports.

## Key Files

- `backend-ci.yml`: Runs backend linting, unit tests, coverage, e2e tests, and a Docker build validation.
- `frontend-ci.yml`: Runs frontend linting, production build validation, and Playwright e2e coverage.
- `cd-manual.yml`: Builds and pushes the backend image to GHCR and can deploy it manually to staging over SSH.

## How it Works

- Both CI workflows start with `dorny/paths-filter` so unrelated changes do not trigger unnecessary jobs.
- The backend pipeline provisions MySQL, syncs the Prisma schema with `prisma db push`, runs the full NestJS test stack, and uploads coverage output.
- The frontend pipeline installs dependencies, builds the Vite app, installs Chromium for Playwright, and uploads the HTML test report when present.
- The manual CD workflow accepts a git ref and image tag, publishes the backend container, and optionally performs a remote staging rollout.

## Integration

- Backend CI validates the API, Prisma schema, shared period filtering, invoice flows, and auth changes before merge.
- Frontend CI validates the SPA routes, auth screens, landing localization, and invoice/report UX.
- The deployment workflow depends on the backend Dockerfile and the runtime environment configured on the staging host.

## Notes

- The CI workflows include quality-gate jobs so skipped path-filtered runs still resolve cleanly.
- The manual deployment workflow currently targets the backend image only; frontend hosting is handled outside this folder.
