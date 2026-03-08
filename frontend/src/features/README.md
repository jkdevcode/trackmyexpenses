# frontend/src/features

Arquitectura vertical por dominio funcional del frontend.

## Responsibilities

- Agrupar componentes, hooks, servicios y tipos por feature.
- Encapsular logica de negocio de UI/API por dominio.
- Facilitar escalabilidad sin mezclar capas entre modulos.

## Main Files

- **`auth/`**: Login, registro, guards y servicios de autenticacion.
- **`dashboard/`**: KPIs, graficas y consumo agregado de facturas.
- **`invoices/`**: OCR, formulario manual, listado y detalle de facturas.
- **`user/`**: Perfil y cambio de contrasena.

## Usage

- Cada feature se integra en rutas desde `src/App.tsx`.
- Los hooks de datos usan React Query y `axiosClient` compartido.
- Mantener dependencias cruzadas al minimo entre features.
