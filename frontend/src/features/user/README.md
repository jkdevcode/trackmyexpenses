# frontend/src/features/user

Feature de perfil de usuario y seguridad de cuenta.

## Responsibilities

- Mostrar/editar datos de perfil autenticado.
- Gestionar cambio de contrasena.
- Sincronizar cambios de perfil con estado de sesion global.

## Main Files

- **`pages/Profile.tsx`**: Vista de perfil y formulario de actualizacion.
- **`components/ChangePasswordCard.tsx`**: Formulario de cambio de contrasena.
- **`hooks/useUserMutations.ts`**: Mutaciones React Query para perfil/seguridad.
- **`services/userService.ts`**: Requests `PATCH /users/:id` y `change-password`.

## Usage

- Disponible en ruta protegida `/profile`.
- Usa `SessionContext` para leer usuario y refrescar datos.
- Comparte validaciones con `src/schemas/profile.ts`.
