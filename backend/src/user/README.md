# backend/src/user

Modulo de gestion de perfil y operaciones de usuario autenticado.

## Responsibilities

- Exponer endpoints de perfil (`me`, update, change-password, delete).
- Aplicar control de acceso con JWT + `SelfOrAdminGuard`.
- Persistir cambios de usuario y foto mediante Prisma/storage.

## Main Files

- **`user.controller.ts`**: Endpoints `/users` y reglas de autorizacion.
- **`user.service.ts`**: Logica de negocio para perfil y contrasena.
- **`dto/update-user.dto.ts`**: Contrato validado para actualizar perfil.
- **`errors/user-not-found.error.ts`**: Error de dominio para usuario inexistente.

## Usage

- Importado por `UserModule` en `AppModule`.
- Invocado por frontend para hydration de sesion (`/users/me`).
- Sus respuestas pasan por el filtro global de errores en `common`.
