# GitHub Workflows

## Description

This folder contains the repository automation for continuous integration and manual delivery. The workflows are split by concern so backend and frontend changes can be validated independently, while Docker build and staging deployment remain deliberate operational steps.

## Responsibilities

- Run backend quality checks only when backend or Prisma files change.
- Run frontend quality checks only when frontend files change.
- Validate the Dockerized stack with a Compose smoke test.
- Build and optionally deploy the backend container image for staging.
- Publish CI artifacts such as coverage summaries and Playwright reports.

## Key Files

- `backend-ci.yml`: Runs backend linting, unit tests, coverage, e2e tests, a backend Docker build, and a full `docker compose` smoke test against `/api/health` and `/healthz`.
- `frontend-ci.yml`: Runs frontend linting, production build validation, Playwright e2e coverage, and uploads the Playwright HTML report.
- `cd-manual.yml`: Builds and pushes the backend image to GHCR and can deploy it manually to staging over SSH with `docker compose`.

## How it Works

- Both CI workflows use native `paths` filters so unrelated changes do not start the workflow at all, while `workflow_dispatch` keeps manual execution available.
- The backend pipeline provisions a MySQL service, syncs the Prisma schema with `prisma db push` for the ephemeral CI database, runs the full NestJS test stack, and posts a coverage summary to pull requests when coverage output exists.
- The backend smoke-test job copies the root `.env.example` and `backend/.env.example`, starts the Docker Compose stack, and probes both the backend and frontend health endpoints.
- The frontend pipeline installs dependencies, builds the Vite app with explicit `VITE_API_URL` and `VITE_ASSETS_URL`, installs Chromium for Playwright, and uploads the HTML report when present.
- The manual CD workflow accepts a git ref and image tag, publishes the backend container to GHCR, validates staging secrets, and can perform a remote `docker compose` rollout over SSH.

## Integration

- Backend CI validates the API, Prisma schema, shared period filtering, invoice flows, auth changes, and container startup behavior.
- Frontend CI validates the SPA routes, auth screens, landing localization, cookie-consent UI copy, and invoice/report UX.
- The deployment workflow depends on the backend Dockerfile, the root Docker Compose setup, and the runtime environment configured on the staging host.

## Notes

- Manual dispatch remains available for both CI workflows even when no matching file changes are present.
- The staging deployment step still performs `git pull` on the remote host before `docker compose up -d`; a future refinement should move fully to immutable image-tag-based deployment.
