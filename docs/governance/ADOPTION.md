# Adopción local de la Constitución de Código Agéntico v1.0

Proyecto: `fegome90-cmd/traza`. Adopción solicitada por Felipe el 2026-10-14. La copia constitucional se conserva íntegra; su alcance no se reduce a este resumen.

## Autoridad, jurisdicción y aprobación

`@fegome90-cmd` es autoridad humana final para operaciones sensibles, excepciones relevantes, promociones a `main` y políticas. Roles en `_ctx/policy/roles.yaml`; rol ausente = `reader`. Los agentes no tienen autoridad para autoelevarse ni aprobar su propio trabajo. La preparación, revisión y aprobación son actos distintos. CODEOWNERS dirige revisiones a Felipe, pero no convierte su autoría en revisión independiente.

Registrar aprobaciones en issue/PR con autor, fecha, acción y alcance, enlazadas a commit y evidencia. Sin revisor independiente disponible, mantener PR abierto y no hacer merge. Las excepciones deben identificar norma, riesgo, compensación, aprobador y duración; máximo por defecto de 30 días, sin renovación tácita.

## Ramas y controles

Rama de tarea + worktree → PR a `develop` → revisión/CI → PR de `develop` a `main`. Aplican las tres condiciones de excepción de worktree de Ley IV, art. 3; no una excepción genérica por comodidad.

- `npm run verify`: lint de repositorio, formato textual mínimo, sintaxis completa, pruebas de dominio y gobernanza y verificación de build sin escrituras.
- `build:check`: contrasta el HTML existente con una compilación temporal. Detecta salida versionada obsoleta sin corregirla silenciosamente.
- CI `quality`: mismas verificaciones, validación de ruta de PR y diff hygiene; permisos `contents: read`, sin credenciales persistidas ni despliegue.
- `.githooks/pre-push`: guard local opt-in para `main`/`develop`; no activa reglas remotas.
- `branch-ruleset.json`: propuesta importable para ambas ramas, PR, una aprobación independiente, check `quality`, sin force-push ni borrado ni bypass. No está activada por existir aquí.

Formato no equivale a un formatter completo; sintaxis JS no equivale a typecheck de dominio; los patrones de secretos no prueban ausencia de datos sensibles. Para UI se mantiene la prueba real de Chromium; Safari/iOS físico y validación clínica siguen fuera del alcance.

## Fuentes y límites clínicos

`src/engine.mjs` y los contratos probados gobiernan el expediente. `t` y `κ` no son intercambiables; búsqueda y expansión parten de `selectView`. El grafo nunca convierte desconocimiento en negación ni copias en observaciones independientes. Datos sintéticos y sus atribuciones permanecen separados. Ningún layout valida el estado de un paciente.

## Estado efectivo

CI inicial confirmado: run `38565954438` para `0cf69df1`. El run del cambio posterior y su revisión se registran en PR #1, no se presumen aquí.

**Protecciones remotas pendientes:** issue #2. La API de rulesets y el estado `protected` de cada rama son la evidencia, no estas políticas. La conexión disponible permite escribir archivos/commits/PR, pero no ofrece una acción para activar rulesets. No hacer merge mientras falten controles y aprobación. No se ha aplicado un bypass ni otorgado permisos adicionales.

## Activación administrativa pendiente

Con aprobación humana y acceso de administración, importar el JSON en **Settings → Rules → Rulesets → Import a ruleset** o usar:

```bash
gh api --method POST repos/fegome90-cmd/traza/rulesets --input docs/governance/branch-ruleset.json
gh api repos/fegome90-cmd/traza/rules/branches/main
gh api repos/fegome90-cmd/traza/rules/branches/develop
```

Consultar antes los rulesets existentes para no duplicarlos; ese comando de creación no es idempotente. Confirmar por API que están activos y que `quality` proviene de GitHub Actions (integration ID `15368`, verificado en el check inicial). Sin revisor independiente habilitado la aprobación requerida bloqueará los merges; no añadir bypass para agentes ni rebajar la regla silenciosamente.
