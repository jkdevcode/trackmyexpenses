# frontend/src/hooks

Hooks transversales no ligados a una feature especifica.

## Responsibilities

- Encapsular logica reutilizable de estado/efectos globales.
- Evitar duplicacion en componentes de presentacion.
- Mantener separada la logica comun de los hooks por feature.

## Main Files

- **`use-theme.ts`**: Utilidades para lectura/cambio del tema de aplicacion.
- **`use-color-theme.tsx`**: Lectura y actualizacion del color de acento global.
- **`README.md`**: Convenciones de uso para hooks compartidos.

## Usage

- Importado por providers, layout y features como `auth`, `invoices`, `reports` y `settings`.
- Los hooks de negocio deben vivir en `src/features/*/hooks`.
- Mantener funciones puras y tipadas para facilitar testeo.
