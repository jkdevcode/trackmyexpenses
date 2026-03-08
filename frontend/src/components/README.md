# frontend/src/components

Componentes compartidos de presentacion usados por varias features y layouts.

## Responsibilities

- Contener UI reutilizable desacoplada de dominio.
- Definir estructura de layout (sidebar, navbar, app shell).
- Centralizar manejo visual de errores y estados de carga.

## Main Files

- **`layout/AppLayout.tsx`**: Shell principal autenticado con sidebar/mobile navbar.
- **`layout/Sidebar.tsx`**: Navegacion desktop y acciones de sesion.
- **`layout/MobileNavbar.tsx`**: Navegacion movil y perfil.
- **`error/AppErrorBoundary.tsx`**: Captura errores de render y fallback.

## Usage

- Consumido por rutas en `src/App.tsx` y paginas autenticadas.
- Reutilizado desde features para mantener consistencia visual.
- No contiene acceso directo a API; solo composicion de UI.
