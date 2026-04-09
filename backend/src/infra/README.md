# Infrastructure Services

## Description

This folder contains technical services that are shared across backend domains but are not themselves business features.

## Responsibilities

- Provide reusable file storage capabilities.
- Integrate external technical services such as exchange-rate lookup and SMTP delivery.
- Hide implementation details behind Nest modules and small service APIs.

## Key Files

- `storage/storage.module.ts`: Registers the storage service and adapter.
- `storage/storage.service.ts`: Thin upload facade used by business modules.
- `exchange-rate/exchange-rate.service.ts`: Fetches currency conversion rates from the configured provider.
- `mail/mail.service.ts`: Sends password recovery emails through SMTP when configured.

## How it Works

- Business modules inject infrastructure services rather than calling file systems or external APIs directly.
- The storage layer returns upload paths that the app serves later through `/uploads`.
- The exchange-rate service fetches rates only when a non-base currency invoice requires normalization.
- The mail service lazily creates the SMTP transporter and safely skips delivery when email settings are incomplete.

## Integration

- `auth` uses storage for optional avatars and mail for forgot-password delivery.
- `user` and `factura` use storage for profile and invoice images.
- `factura` uses exchange rates when the invoice currency differs from the user's base currency.

## Notes

- These services are intentionally low-level so domain modules remain focused on business rules.
- Missing external configuration should surface as controlled domain behavior, not as silent data corruption.
