# Workflows CI/CD

Este directorio contiene los pipelines de GitHub Actions del proyecto `trackmyexpenses`.

## Archivos

### `backend-ci.yml`
- Ejecuta CI del backend (NestJS + Prisma + MySQL).
- Trigger:
  - `push` y `pull_request` cuando cambian archivos en `backend/**` o el propio workflow.
  - `workflow_dispatch` manual.
- Flujo principal:
  1. Levanta servicio `mysql:8` (DB de pruebas).
  2. Instala dependencias (`npm ci`).
  3. Espera salud de MySQL.
  4. Sincroniza esquema Prisma (`prisma db push`).
  5. Ejecuta `lint`, unit tests, coverage y e2e.
  6. Sube artefacto de coverage y comenta resumen en PR.
- Incluye:
  - `backend-docker-build` (build de imagen sin push).
  - `backend-quality-gate` (falla si calidad o docker fallan).

### `frontend-ci.yml`
- Ejecuta CI del frontend.
- Trigger:
  - `push` y `pull_request` cuando cambian archivos en `frontend/**` o el propio workflow.
  - `workflow_dispatch` manual.
- Flujo principal:
  1. `npm ci`
  2. `eslint`
  3. `build`
  4. Playwright e2e (instala Chromium + dependencias)
  5. Sube reporte Playwright como artefacto.
- Incluye `frontend-quality-gate`.

### `cd-manual.yml`
- Pipeline de despliegue manual (CD).
- Trigger:
  - Solo `workflow_dispatch`.
- Inputs:
  - `ref`: rama/tag/SHA a desplegar.
  - `image_tag`: tag de imagen.
  - `deploy_staging`: si despliega staging después del push.
- Flujo:
  1. Build + push de imagen backend a GHCR.
  2. (Opcional) deploy en servidor staging por SSH.

## Secretos requeridos

### Para `cd-manual.yml`
- `STAGING_HOST`
- `STAGING_USER`
- `STAGING_SSH_KEY`

> `GITHUB_TOKEN` lo provee GitHub Actions automáticamente para login en GHCR.

## Troubleshooting rápido

### Backend e2e se queda “colgado” aunque pasen los tests
- Causa usual: handles abiertos en Jest.
- Mitigación en CI:
  - `npm run test:e2e:ci` usa `--runInBand --forceExit`.
  - `timeout-minutes` en job de calidad.
- Diagnóstico local:
  - `npm run test:e2e:debug-handles`

### Prisma no conecta a MySQL en CI
- Verificar que `backend-quality` tenga:
  - servicio `mysql:8`
  - `DATABASE_URL` válido
  - paso `prisma db push`
  - espera de salud antes de tests

## Buenas prácticas
- Mantener filtros `paths` para evitar ejecuciones innecesarias.
- Evitar pasos destructivos en workflows de PR.
- Si agregas nuevos jobs, actualiza este README y los `quality-gate`.
