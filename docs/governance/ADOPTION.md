# Adopción local de la Constitución de Código Agéntico v1.0

Proyecto: `fegome90-cmd/traza` · adoptada como guía normativa de cambios en el repositorio el 14-10-2026.

## Autoridad operativa y alcance

- **Titular y autoridad humana final:** cuenta de GitHub `@fegome90-cmd` (aprobación de operaciones sensibles, excepciones relevantes, promociones a `main` y modificaciones de políticas).
- **Agentes colaboradores:** sin autoridad automática para aprobar; usar los roles de `_ctx/policy/roles.yaml`. Rol ausente = `reader`.
- **Revisión independiente:** obligatoria para cambios de código según su riesgo. Si no existe revisor independiente disponible, **dejar el PR abierto/no hacer merge**. La titularidad del repositorio no constituye aprobación técnica externa.
- **Registro de aprobaciones:** comentario explícito en issue/PR enlazado con fecha, autor, acción, alcance y motivo; los checks y commit identifican la evidencia técnica.
- **Excepciones:** documentar norma, riesgo, control compensatorio, aprobador y vencimiento (máximo de referencia 30 días) en issue/PR. No conceder permisos extra por inferencia.

## Ramas y validaciones

`feat/*`, `fix/*`, `docs/*`, `chore/*` → **PR a `develop`** → revisión/CI → promoción **PR de `develop` a `main`**. No push directo a `main` durante desarrollo. Configurar el ruleset real en GitHub además de esta política textual: exigir PR, checks `quality` y revisión de la rama estable. **Un archivo en el repositorio no activa por sí mismo branch protection.**

Gates proporcionados: Node syntax check, pruebas `node --test`, build Python sin dependencias, comparación exacta del HTML generado, `git diff --check`. Para cambios visuales: smoke Playwright/Chromium u otra evidencia navegable. Los controles de seguridad sobre secretos y dependencias se revisan además en PR; no se declara un escáner instalado si no está.

## Source of truth y política clínica

El prototipo usa casos sintéticos. `t` y `κ` no se intercambian; la fuente de verdad del estado documental es el expediente (`src/engine.mjs`), no el layout. Un dato no estructurado, una inferencia del extractor y una observación documentada se mantienen distinguibles. Prohibida cualquier afirmación de validación clínica sin evaluación específica.

## Estado de adopción inicial

- Política escrita: incluida en el PR de bootstrap.
- Enforcement en CI: propuesto en `.github/workflows/quality.yml`, pendiente de confirmar el run en GitHub al abrir PR.
- Enforcement remoto de reglas de ramas: **no configurado por esta entrega**; requiere habilitación verificable en ajustes de GitHub. Hasta entonces aplica revisión humana y no realizar merges.
