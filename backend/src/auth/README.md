# backend/src/auth

Modulo de autenticacion y autorizacion basado en JWT por cookie.

## Responsibilities

- Registrar usuarios y autenticar credenciales.
- Emitir JWT y setear/limpiar cookie `token`.
- Proteger endpoints via guards de rol y ownership.

## Main Files

- **`auth.controller.ts`**: Endpoints `register`, `login` y `logout`.
- **`auth.service.ts`**: Hash de contrasena, validacion y firma de token.
- **`jwt.strategy.ts`**: Extrae token desde cookie y valida usuario.
- **`guards/self-or-admin.guard.ts`**: Regla de acceso propietario o admin.

## Usage

- Importado en `AppModule` como `AuthModule`.
- Consumido por `UserController`, `FacturaController` y rutas protegidas.
- Swagger declara `cookieAuth` para pruebas manuales en `/docs`.
