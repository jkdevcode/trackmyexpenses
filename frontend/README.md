# frontend

SPA React (Vite + TypeScript) que consume la API del backend y renderiza dashboard, perfil, facturas, configuracion y reportes.

## Responsibilities

- Implementar UI por features (`auth`, `dashboard`, `invoices`, `user`, `settings`, `reports`, `landing`).
- Consumir API con `axiosClient` y cachear datos con React Query.
- Gestionar sesion y preferencias del usuario (tema, idioma, color de acento, moneda base) en rutas protegidas.

## Main Files

- **`src/main.tsx`**: Entrada de app, router, providers y estilos globales.
- **`src/provider.tsx`**: QueryClient, HeroUI, SessionProvider, ThemeProvider, ColorThemeProvider y error boundary.
- **`src/App.tsx`**: Definicion de rutas lazy para landing, auth, dashboard, invoices, profile, settings y reports.
- **`src/lib/axiosClient.ts`**: Cliente HTTP central (`withCredentials: true`).

## Usage

- Desarrollo: `npm install && npm run dev`.
- Calidad: `npm run lint`.
- Build: `npm run build`.
- Arquitectura: componentes genericos en `src/components`, logica vertical en `src/features` y formularios validados via `src/schemas`.
