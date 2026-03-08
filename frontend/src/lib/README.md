# frontend/src/lib

Servicios base de infraestructura cliente reutilizados por toda la SPA.

## Responsibilities

- Configurar cliente HTTP compartido.
- Proveer instancia global de React Query.
- Inicializar monitoreo de errores en frontend.

## Main Files

- **`axiosClient.ts`**: Axios con `withCredentials` e interceptor de 401.
- **`queryClient.ts`**: Configuracion central de cache/mutations de React Query.
- **`sentry.ts`**: Inicializacion de Sentry en runtime.

## Usage

- Importado por servicios en `src/features/*/services`.
- Cargado desde `provider.tsx` y `main.tsx`.
- Debe mantenerse libre de dependencias de UI.
