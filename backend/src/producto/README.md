# backend/src/producto

Modulo para catalogo de productos reutilizable en facturas manuales y OCR.

## Responsibilities

- Crear y listar productos privados del usuario autenticado.
- Validar duplicados por codigo dentro del catalogo de cada usuario.
- Exponer contratos DTO para formularios manuales y enriquecimiento OCR.

## Main Files

- **`producto.controller.ts`**: Endpoints REST de productos.
- **`producto.service.ts`**: Logica de negocio user-scoped y persistencia.
- **`dto/create-producto.dto.ts`**: Validacion de payload de creacion.
- **`errors/producto-not-found.error.ts`**: Error de dominio de producto.

## Usage

- Importado por `ProductoModule`.
- Utilizado por `FacturaService` y el flujo OCR para resolver productos del usuario actual.
- Consumido por frontend en el formulario manual y la revision OCR de facturas.
