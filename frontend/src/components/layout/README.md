# frontend/src/components/layout

Componentes de navegacion y estructura para la aplicacion autenticada.

## Responsibilities

- Definir shell responsive desktop/mobile.
- Encapsular items de menu y accesos de navegacion.
- Integrar acciones de perfil y cierre de sesion.

## Main Files

- **`AppLayout.tsx`**: Contenedor principal con `Outlet` de rutas.
- **`Sidebar.tsx`**: Navegacion lateral para desktop.
- **`MobileNavbar.tsx`**: Menu movil y accesos rapidos.
- **`NavItem.tsx`**: Item reutilizable de menu.

## Usage

- Importado por `src/App.tsx` dentro de `ProtectedRoute`.
- Consumido por todas las rutas privadas (`dashboard`, `profile`, `invoices`).
- Depende de `SessionContext` y `theme` para estado visual y sesion.
