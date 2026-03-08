# frontend/src/styles

Recursos de estilo global y assets de apoyo visual para la UI.

## Responsibilities

- Definir estilos globales base de Tailwind/HeroUI.
- Exponer recursos visuales usados por paginas de marketing.
- Mantener consistencia de tipografia, spacing y reset global.

## Main Files

- **`globals.css`**: Estilos globales cargados en `main.tsx`.
- **`imgs.tsx`**: Export de imagenes/recursos para secciones visuales.

## Usage

- `globals.css` se carga una sola vez en el entrypoint.
- `imgs.tsx` se consume en componentes de `features/landing`.
- Evitar logica de negocio en esta carpeta.
