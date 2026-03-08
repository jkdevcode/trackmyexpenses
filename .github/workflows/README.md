# .github/workflows

Pipelines de GitHub Actions para validacion continua y despliegue manual del proyecto.

## Responsibilities

- Ejecutar CI de backend (`backend-ci.yml`).
- Ejecutar CI de frontend (`frontend-ci.yml`).
- Construir/publicar imagen de backend y despliegue staging manual (`cd-manual.yml`).

## Main Files

- **`backend-ci.yml`**: Lint, tests, e2e, coverage y build Docker del backend.
- **`frontend-ci.yml`**: Lint, build y pruebas Playwright del frontend.
- **`cd-manual.yml`**: Build/push a GHCR y deploy opcional por SSH.
- **`README.md`**: Referencia de los workflows y secretos requeridos.

## Usage

- Se dispara automaticamente en `push`/`pull_request` segun `paths`.
- Tambien se puede ejecutar manualmente con `workflow_dispatch`.
- Revisar artefactos (coverage/reportes) desde la pestaña Actions del PR.
