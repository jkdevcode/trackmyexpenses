# frontend/src/types

Tipos globales compartidos por multiples features.

## Responsibilities

- Exponer contratos comunes de TypeScript.
- Evitar duplicacion de tipos entre modulos.
- Servir como punto de export para tipos transversales.

## Main Files

- **`index.ts`**: Barrel de tipos globales del proyecto.
- **`README.md`**: Convenciones para agregar nuevos tipos compartidos.

## Usage

- Importado por features cuando el tipo no es de dominio local.
- Los tipos especificos de feature deben vivir en `src/features/*/types.ts`.
- Mantener nombres claros y estables para evitar acoplamiento.
