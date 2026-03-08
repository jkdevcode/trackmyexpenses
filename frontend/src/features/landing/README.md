# frontend/src/features/landing

Feature de pagina publica de marketing/entrada del producto.

## Responsibilities

- Renderizar secciones informativas del producto.
- Exponer CTAs hacia login/registro.
- Reutilizar componentes visuales desacoplados del area privada.

## Main Files

- **`components/LandingHeader.tsx`**: Navegacion publica y acceso a auth.
- **`components/HeroSection.tsx`**: Seccion principal de valor.
- **`components/FeatureShowcase.tsx`**: Bloques de funcionalidades.
- **`components/LandingFooter.tsx`**: Footer y links de cierre.

## Usage

- Consumido por `src/pages/landing.tsx`.
- No depende de session ni rutas protegidas.
- Utiliza recursos de `src/styles` y componentes de `src/components/ui`.
