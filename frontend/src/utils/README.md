# frontend/src/utils

Funciones auxiliares puras usadas por varias capas del frontend.

## Responsibilities

- Normalizar manejo de errores de red/backend.
- Centralizar helpers agnosticos de React.
- Reducir repeticion de logica utilitaria.

## Main Files

- **`errors.ts`**: Extrae mensajes amigables desde Axios/backend/i18n.
- **`README.md`**: Convenciones para utilidades compartidas.

## Usage

- Consumido por hooks y paginas al manejar `catch`.
- Mantener funciones puras y tipadas (`unknown` en entradas externas).
- No incluir estado ni dependencias de UI en este directorio.
