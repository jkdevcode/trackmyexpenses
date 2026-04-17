# Postman Collection

## Description

This folder contains the shared Postman collection for the backend API. It complements Swagger by giving the team a ready-to-import request set for manual API exploration, smoke checks, and QA flows.

## Responsibilities

- Store the maintained Postman collection for the TrackMyExpenses API.
- Group requests by backend domain so common flows are easy to test.
- Provide importable request examples for auth, users, products, invoices, OCR, and reports.

## Key Files

- `trackmyexpenses.postman_collection.json`: Main Postman collection with organized folders for `Auth`, `Users`, `Products`, `Facturas`, and `Reports`.

## How it Works

- Import the JSON file into Postman and set the `baseURL` collection variable, for example `http://localhost:3000`.
- Use the auth requests first when you need a logged-in Postman session for protected endpoints.
- The collection includes the recent password-recovery endpoints, invoice filter endpoints, OCR requests, and report requests so the most important flows can be exercised without rebuilding requests manually.
- Swagger remains the controller-level reference for schema docs, while Postman is the practical request runner for end-to-end verification.

## Integration

- Lives under `backend/docs` so API reference assets stay close to the backend service.
- Should be kept in sync with controller DTOs, Swagger annotations, and any environment-dependent base URL changes.
- Useful alongside `.github/workflows/backend-ci.yml` when reproducing issues locally after CI or smoke-test failures.

## Notes

- The collection was moved into `backend/docs/postman` to keep operational API assets grouped in one place.
- Update the stored request bodies whenever auth, invoice, or reporting contracts change.
