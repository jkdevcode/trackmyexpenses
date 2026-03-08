# frontend/src/schemas

Esquemas Yup para validacion de formularios en cliente.

## Responsibilities

- Centralizar reglas de validacion reutilizables.
- Mantener mensajes compatibles con i18n.
- Servir de contrato para React Hook Form (`yupResolver`).

## Main Files

- **`auth.ts`**: Reglas para login y registro.
- **`profile.ts`**: Reglas para perfil y cambio de contrasena.
- **`invoice.ts`**: Reglas para formulario OCR/confirmacion de factura.

## Usage

- Importados por paginas/components de features (`auth`, `user`, `invoices`).
- Deben mantenerse sincronizados con validaciones backend.
- Evitar logica de negocio aqui; solo validacion de entrada.
