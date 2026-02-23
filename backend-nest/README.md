# Backend - TrackMyExpenses

API RESTful construida con NestJS para la gestión de gastos y procesamiento de facturas.

## Descripción

Servidor encargado de la lógica de negocio, autenticación, persistencia de datos y servicios de integración con IA para el procesamiento de imágenes.

## Stack Tecnológico

- **Core:** NestJS 11
- **ORM:** Prisma (MySQL)
- **Validación:** Zod (nestjs-zod)
- **Documentación:** Swagger (OpenAPI)
- **Autenticación:** Passport-JWT
- **Servicios Externos:** Google Generative AI, Tesseract.js

## Arquitectura

Sigue la arquitectura modular de NestJS, organizada en controladores, servicios y módulos.
Las entidades principales están definidas en el esquema de Prisma y mapeadas a DTOs validados con Zod.

### Módulos Principales

- **AuthModule:** Manejo de sesiones, Login, Registro, Generación y validación de JWT.
- **UserModule:** Gestión de usuarios, Perfil, Actualización de datos, Cambio de contraseña.
- **FacturaModule:** CRUD de facturas y asociación con usuarios.
- **FacturaOcrModule:** Lógica para procesamiento de imágenes (OCR + LLM) y extracción de datos estructurados.

## Manejo de Errores

Se utiliza un filtro global de excepciones para estandarizar las respuestas JSON.

- `ConflictException`: Para duplicados (ej. correo ya registrado).
- `UnauthorizedException`: Fallos de autenticación.
- `BadRequestException`: Errores de validación de datos (Zod).

## Seguridad

- **Contraseñas:** Hashing seguro utilizando `bcrypt`.
- **JWT:** Tokens firmados para control de sesión stateless.
- **Separación de Responsabilidades:** Endpoints dedicados para actualización de perfil vs. cambio de contraseña para mayor seguridad.

## Documentación API

El proyecto incluye documentación automática con Swagger.
Acceso (en desarrollo): `http://localhost:3000/api` (o la ruta configurada).
