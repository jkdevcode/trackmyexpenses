# frontend/src/features/auth

Feature de autenticacion y control de acceso de rutas.

## Responsibilities

- Renderizar formularios de login y registro.
- Ejecutar llamadas API de autenticacion (`login`, `register`, `logout`).
- Proteger rutas publicas/privadas con wrappers de navegacion.

## Main Files

- **`pages/Login.tsx`**: Formulario de acceso y set de sesion.
- **`pages/Register.tsx`**: Alta de usuario con carga opcional de foto.
- **`services/authService.ts`**: DTOs y requests auth tipados.
- **`components/ProtectedRoute.tsx`**: Gate para rutas autenticadas.

## Usage

- Integrado en `src/App.tsx` mediante `PublicOnlyRoute` y `ProtectedRoute`.
- Usa `SessionContext` para hidratar/invalidar sesion.
- Sus mutaciones se ejecutan con React Query (`hooks/useAuthMutations.ts`).
