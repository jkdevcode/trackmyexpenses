# frontend/src/features/user

Feature de perfil de usuario y seguridad de cuenta.

## Responsibilities

- Mostrar/editar datos de perfil autenticado.
- Gestionar cambio de contrasena y moneda base del usuario.
- Sincronizar cambios de perfil/preferencias con estado de sesion global.

## Main Files

- **`pages/Profile.tsx`**: Vista de perfil, foto y formulario de actualizacion.
- **`components/ChangePasswordCard.tsx`**: Formulario de cambio de contrasena.
- **`hooks/useUserMutations.ts`**: Mutaciones React Query para perfil/seguridad.
- **`services/userService.ts`**: Requests `PATCH /users/:id` y `change-password`.

## Usage

- Disponible en ruta protegida `/profile` y reutilizado por `settings` para guardar `monedaBase`.
- Usa `SessionContext` para leer usuario y refrescar datos.
- Comparte validaciones con `src/schemas/profile.ts`.
