# backend/src/infra

Infraestructura tecnica desacoplada de dominio para almacenamiento y servicios externos.

## Responsibilities

- Proveer abstracciones de almacenamiento de archivos.
- Integrar servicios tecnicos externos como tasas de cambio.
- Exponer servicios reutilizables para modulos de negocio.

## Main Files

- **`storage/storage.module.ts`**: Wiring del servicio de storage.
- **`storage/storage.service.ts`**: Fachada para upload de archivos.
- **`storage/adapters/local-storage.adapter.ts`**: Implementacion local en disco.
- **`exchange-rate/exchange-rate.service.ts`**: Cliente HTTP para conversion entre monedas.

## Usage

- `storage` es consumido por `auth`, `user` y `factura` para fotos e imagenes de facturas.
- `exchange-rate` es consumido por `factura` cuando la moneda de la factura difiere de la moneda base del usuario.
- Los archivos se sirven via `ServeStaticModule` en `/uploads` y las tasas usan `EXCHANGE_RATE_API_KEY`/`EXCHANGE_RATE_API_URL`.
