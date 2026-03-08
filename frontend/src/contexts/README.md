# frontend/src/contexts

Providers globales de estado transversal para sesion, tema y consentimiento.

## Responsibilities

- Mantener estado de usuario autenticado en toda la app.
- Exponer configuracion de tema claro/oscuro.
- Registrar consentimiento de cookies del usuario.

## Main Files

- **`session-context.tsx`**: Hydration con `/users/me`, `login`, `logout` y guard de 401.
- **`theme-context.tsx`**: Estado de tema y persistencia visual.
- **`cookie-consent-context.tsx`**: Control de banner/estado de consentimiento.

## Usage

- Montados en `src/provider.tsx`.
- Consumidos via hooks (`useSession`, etc.) desde componentes y rutas.
- Coordinan autenticacion por cookies sin exponer token en JS.
