# Frontend - TrackMyExpenses

Aplicación web moderna construida con React y HeroUI para la gestión de finanzas personales.

## Descripción
Interfaz de usuario responsiva y amigable que permite a los usuarios interactuar con el sistema de gastos, visualizar su perfil y cargar facturas.

## Stack Tecnológico
*   **Core:** React 19, TypeScript, Vite
*   **UI:** HeroUI (NextUI), Tailwind CSS v4, Framer Motion
*   **Routing:** React Router v7
*   **Estado/Forms:** Context API, Yup, Formik/React Hook Form
*   **i18n:** i18next, react-i18next

## Arquitectura
La estructura del proyecto está organizada por capas funcionales:
*   `src/pages`: Vistas principales (Login, Dashboard, Profile).
*   `src/components`: Componentes reutilizables (UI) y específicos de dominio.
*   `src/layouts`: Estructuras base (AppLayout, AuthLayout).
*   `src/contexts`: Gestión de estado global (SessionContext, ThemeContext).
*   `src/features`: Lógica encapsulada por funcionalidad (auth, facturas).

## Sistema de Navegación
Diseño adaptativo para ofrecer la mejor experiencia en cualquier dispositivo:
*   **Desktop/Tablet:** `Sidebar` lateral fijo o colapsable.
*   **Mobile:** `MobileNavbar` inferior/superior para acceso rápido.
*   Estilos visuales gestionados mediante variables de tema y `colorApp`.

## Autenticación
*   **Rutas Protegidas:** Wrapper `ProtectedRoute` que verifica la sesión antes de renderizar contenido privado.
*   **Manejo de Sesión:** `SessionContext` mantiene el estado del usuario y token.
*   **Persistencia:** Recuperación de sesión al recargar mediante almacenamiento local/cookies.

## UX/UI
*   **Temas:** Soporte nativo para modo Claro y Oscuro, sincronizado con HeroUI.
*   **Internacionalización:** Cambio dinámico de idioma (Español / Inglés).
*   **Feedback:** Uso de Toasts para notificaciones de éxito o error en operaciones asíncronas.
