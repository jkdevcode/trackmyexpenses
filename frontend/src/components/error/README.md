# frontend/src/components/error

Componentes para captura y presentacion de errores de render en React.

## Responsibilities

- Aislar fallos de UI con boundaries.
- Mostrar fallback seguro cuando una rama de componentes falla.
- Evitar caidas globales de la aplicacion.

## Main Files

- **`AppErrorBoundary.tsx`**: Error boundary principal reutilizable.

## Usage

- Montado en `provider.tsx` y rutas criticas en `App.tsx`.
- Recomendado envolver nuevas vistas lazy o modulos inestables.
- Complementa manejo de errores de red definido en `src/utils/errors.ts`.
