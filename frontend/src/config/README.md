# frontend/src/config

Configuracion estatica de metadata y opciones globales del cliente.

## Responsibilities

- Centralizar constantes de configuracion de la app.
- Evitar hardcode de textos/URLs repetidas.
- Servir como punto unico para ajustes de sitio.

## Main Files

- **`site.ts`**: Nombre, descripcion y metadata base del sitio.

## Usage

- Consumido por layouts/paginas para titulos y branding.
- Se importa desde componentes que necesitan metadata comun.
- Mantener valores agnosticos al entorno (env en `import.meta.env`).
