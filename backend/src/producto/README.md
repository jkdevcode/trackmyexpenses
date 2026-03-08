# backend/src/producto

Modulo para catalogo de productos reutilizable en facturas manuales y OCR.

## Responsibilities

- Crear y listar productos del sistema.
- Validar duplicados por codigo de producto.
- Exponer contratos DTO para entrada segura.

## Main Files

- **`producto.controller.ts`**: Endpoints REST de productos.
- **`producto.service.ts`**: Logica de negocio y persistencia.
- **`dto/create-producto.dto.ts`**: Validacion de payload de creacion.
- **`errors/producto-not-found.error.ts`**: Error de dominio de producto.

## Usage

- Importado por `ProductoModule`.
- Utilizado por `FacturaService` para construir items de factura.
- Consumido por frontend en el formulario manual de facturas.
