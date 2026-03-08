# frontend/src/pages

Entradas de rutas de nivel app que ensamblan features y layouts.

## Responsibilities

- Exponer paginas lazy importadas por `src/App.tsx`.
- Componer features sin concentrar logica de negocio.
- Mantener vistas base del routing publico y utilitario.

## Main Files

- **`landing.tsx`**: Wrapper de la pagina publica principal.
- **`Dashboard.tsx`**: Entrada de dashboard (delegada a feature).
- **`NewInvoicePage.tsx`**: Contenedor de tabs OCR/manual/listado.
- **`404.tsx`**: Pagina de recurso no encontrado.

## Usage

- Mapeadas directamente en rutas de React Router.
- Deben depender de hooks/services de `src/features`.
- Evitar acceso directo a API desde este nivel.
