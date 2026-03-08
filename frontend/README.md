# frontend

SPA React (Vite + TypeScript) que consume la API del backend y renderiza dashboard, perfil y flujo OCR.

## Responsibilities

- Implementar UI por features (`auth`, `dashboard`, `invoices`, `user`, `landing`).
- Consumir API con `axiosClient` y cachear datos con React Query.
- Gestionar sesion mediante cookies HttpOnly (login/logout/me) y rutas protegidas.

## Main Files

- **`src/main.tsx`**: Entrada de app, router, providers y estilos globales.
- **`src/provider.tsx`**: QueryClient, HeroUI, SessionProvider, ThemeProvider y error boundary.
- **`src/App.tsx`**: Definicion de rutas lazy + wrappers `ProtectedRoute/PublicOnlyRoute`.
- **`src/lib/axiosClient.ts`**: Cliente HTTP central (`withCredentials: true`).

## Usage

- Desarrollo: `npm install && npm run dev`.
- Calidad: `npm run lint`.
- Build: `npm run build`.
- Arquitectura: componentes genericos en `src/components`, logica vertical en `src/features` y formularios validados via `src/schemas`.
