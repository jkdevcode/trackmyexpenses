# Storage Infrastructure

## Description

This folder contains the backend file storage abstraction used for user avatars and invoice images.

## Responsibilities

- Define the storage adapter contract.
- Expose a simple upload service to business modules.
- Provide the current local-disk adapter and keep it replaceable.

## Key Files

- `storage.interface.ts`: Storage token and adapter contract.
- `storage.service.ts`: Shared upload facade used by domain services.
- `storage.module.ts`: Registers the active storage adapter.
- `adapters/local-storage.adapter.ts`: Current implementation that writes files under the configured uploads directory.

## How it Works

- Domain services call `StorageService.upload()` with a buffer, file name, and optional folder.
- The configured adapter persists the file and returns a relative path that can later be served to clients.
- The local adapter organizes assets into domain-specific subfolders such as `users` and `invoices`.

## Integration

- Used by `auth` during registration, `user` for profile photo updates, and `factura` for invoice image persistence.
- Works together with `ServeStaticModule` in `AppModule`, which exposes saved files under `/uploads`.
- Health checks validate the writability of the same uploads directory.

## Notes

- The adapter boundary is intentionally narrow so cloud storage implementations can replace the local adapter without changing domain code.
