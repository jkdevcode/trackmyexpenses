# frontend/src/components/ui

Bloques UI reutilizables y wrappers sobre componentes HeroUI.

## Responsibilities

- Proveer controles visuales comunes (switches, iconos, loaders).
- Encapsular componentes transversales como consentimiento de cookies.
- Mantener consistencia de props/estilos en toda la app.

## Main Files

- **`LoadingSpinner.tsx`**: Spinner comun para estados de carga/lazy.
- **`theme-switch.tsx`**: Control de cambio de tema.
- **`language-switch.tsx`**: Selector de idioma i18n.
- **`cookie-consent.tsx`**: Banner/modal de consentimiento.

## Usage

- Consumido por layouts, paginas y features.
- Debe permanecer agnostico de dominio de negocio.
- Reutiliza tokens desde `src/theme`.
