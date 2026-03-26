# frontend/src/contexts

Providers globales de estado transversal para sesion, tema, color de acento y consentimiento.

## Responsibilities

- Mantener estado de usuario autenticado en toda la app.
- Exponer configuracion de tema claro/oscuro y color de acento.
- Registrar consentimiento de cookies del usuario.

## Main Files

- **`session-context.tsx`**: Hydration con `/users/me`, `login`, `logout` y guard de 401.
- **`theme-context.tsx`**: Estado de tema y persistencia visual.
- **`color-theme.tsx`**: Preferencia global de color de acento de la app.
- **`cookie-consent-context.tsx`**: Control de banner/estado de consentimiento.

## Usage

- Montados en `src/provider.tsx`.
- Consumidos via hooks (`useSession`, `useTheme`, `useColorTheme`) desde componentes y rutas.
- Coordinan autenticacion por cookies y preferencias de UI sin exponer token en JS.
