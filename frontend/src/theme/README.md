# frontend/src/theme

Configuracion central de tokens visuales y variantes de color.

## Responsibilities

- Definir paleta semantica usada por HeroUI/Tailwind.
- Exponer variantes reutilizables para componentes.
- Mantener coherencia visual entre modulos y features.

## Main Files

- **`theme.config.ts`**: Colores base, app color y utilidades de tema.
- **`app-color-variants.ts`**: Clases/variantes derivadas para UI.
- **`README.md`**: Guia de uso de tokens compartidos.

## Usage

- Consumido por componentes de layout y features.
- Referenciado por estilos y utilidades de presentacion.
- Evitar hardcodear colores fuera de este directorio.
