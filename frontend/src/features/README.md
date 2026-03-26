# frontend/src/features

Arquitectura vertical por dominio funcional del frontend.

## Responsibilities

- Agrupar componentes, hooks, servicios y tipos por feature.
- Encapsular logica de negocio de UI/API por dominio.
- Facilitar escalabilidad sin mezclar capas entre modulos.

## Main Files

- **`auth/`**: Login, registro, guards y servicios de autenticacion.
- **`dashboard/`**: KPIs, graficas y consumo agregado de facturas.
- **`invoices/`**: OCR, formulario manual, listado, detalle y edicion de facturas.
- **`reports/`**: Filtros por fecha y descarga de PDF.
- **`settings/`**: Tema, idioma, color de acento y moneda base.
- **`user/`**: Perfil y cambio de contrasena.
- **`landing/`**: Pagina publica de presentacion del producto.

## Usage

- Cada feature se integra en rutas desde `src/App.tsx`.
- Los hooks de datos usan React Query, `axiosClient` y contextos compartidos.
- Mantener dependencias cruzadas al minimo entre features.
