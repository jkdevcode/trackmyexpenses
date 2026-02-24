# TrackMyExpenses

Sistema fullstack para la gestión de gastos y facturas, con integración de IA para procesamiento de documentos.

## Descripción
Plataforma web que permite a los usuarios registrar y gestionar sus facturas y gastos. Incluye autenticación segura, gestión de perfil, y una herramienta avanzada de OCR y IA (Gemini) para la extracción automática de datos desde imágenes de facturas.

## Stack Tecnológico

### Backend
*   **Framework:** NestJS (Node.js)
*   **Base de Datos:** MySQL (Gestión con Prisma ORM)
*   **Validación:** Zod + NestJS Pipes
*   **IA/OCR:** Tesseract.js, Google Generative AI
*   **Documentación:** Swagger

### Frontend
*   **Framework:** React 19 + Vite
*   **Lenguaje:** TypeScript
*   **UI Library:** HeroUI (NextUI fork) + Tailwind CSS v4
*   **Routing:** React Router v7
*   **Internacionalización:** i18next (Español / Inglés)

## Arquitectura General
El sistema sigue una arquitectura cliente-servidor desacoplada (RESTful API).
*   **Frontend:** SPA que consume la API REST, gestiona el estado de sesión y la navegación.
*   **Backend:** API modular que expone endpoints seguros, gestiona la lógica de negocio y conecta con la BD y servicios de IA.

## Autenticación
*   **Mecanismo:** JSON Web Tokens (JWT).
*   **Flujo:** Login devuelve un token que el frontend almacena y envía en el header `Authorization: Bearer <token>`.
*   **Protección:** Guards en NestJS y componentes de rutas protegidas en React.

## Características Principales
*   **Gestión de Usuarios:** Registro, Login, Perfil de Usuario, Cambio de Contraseña.
*   **Internacionalización (i18n):** Soporte completo para ES (Español) y EN (Inglés).
*   **UI/UX Moderna:** Tema Claro/Oscuro, diseño responsivo (Sidebar en desktop, Navbar en mobile), Toasts para feedback.
*   **Procesamiento Inteligente:** Carga de imágenes de facturas y extracción automática de productos y totales.

## Estructura del Repositorio
*   `/backend`: Código fuente del servidor (API).
*   `/frontend`: Código fuente de la aplicación cliente (Web).

## Cómo Levantar el Proyecto

### Backend
1.  Configurar variables de entorno en `.env` (Basado en ejemplo).
2.  Instalar dependencias: `npm install`
3.  Iniciar desarrollo: `npm run start:dev`

### Frontend
1.  Instalar dependencias: `npm install`
2.  Iniciar desarrollo: `npm run dev`
