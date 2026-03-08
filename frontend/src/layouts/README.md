# frontend/src/layouts

Layouts de pagina para composicion de vistas de alto nivel.

## Responsibilities

- Definir estructuras base reutilizables entre paginas.
- Encapsular contenedores visuales (publico/autenticado).
- Reducir codigo repetido en paginas concretas.

## Main Files

- **`default.tsx`**: Layout base reutilizable para vistas internas.
- **`landing.tsx`**: Layout de la pagina publica de inicio.
- **`README.md`**: Referencia de responsabilidades de layout.

## Usage

- Importados por paginas en `src/pages` y features publicas.
- Complementan `AppLayout` cuando se necesita estructura mas simple.
- Mantienen coherencia entre responsive, espaciados y wrappers.
