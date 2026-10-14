# Bootstrap y saneamiento del repositorio

## Intención autorizada y alcance

Felipe (`@fegome90-cmd`), 2026-10-14: configurar `fegome90-cmd/traza` con documentación, reglas, `.gitignore` y la Constitución Agéntica; continuación solicitada en esta conversación. La autorización comprende preparar/publicar estos cambios de gobernanza en el PR #1, no aprobarlos como revisor independiente, hacer merge, desplegar o modificar secretos.

Rol de ejecución acotado: `maintainer` para esta configuración solicitada. Felipe conserva `human-approver`. Riesgo alto por tocar gobernanza y CI. No hay autorización para nuevas excepciones constitucionales.

## Plan y aceptación

1. Recuperar PR #1 y commit `0cf69df1d621536ba168676bb231ad6ac30b5200`; comprobar CI remoto y coincidencia de los árboles de `src`, `tests`, `data`, `dist` y `licenses` con la copia local. Trabajar en worktree aislado, sin otra rama/PR remotos.
2. Mantener íntegra la constitución y el código/HTML/datasets. Corregir las instrucciones de worktree, completar CODEOWNERS, EditorConfig, exclusiones locales y controles proporcionales de repositorio.
3. Pruebas primero para formato, archivos sensibles, promoción de ramas y HTML obsoleto. La verificación no debe sobrescribir `dist` antes de compararlo. Ejecutar los 109 tests existentes y regresiones nuevas.
4. Publicar sólo el diff en `chore/agentic-foundation`, sin forzar refs. Comprobar CI sobre el SHA final; actualizar PR #1 e issue #2. No declarar activadas protecciones remotas por escribir JSON o políticas.

## Hallazgos previos

- El CI inicial pasó: run `38565954438`. No equivale a protección de ramas.
- `AGENTS.md` y CONTRIBUTING relajaban worktrees respecto de Ley IV, art. 3.
- El CI compilaba antes de comparar dos builds nuevos: no detectaba `dist` versionado obsoleto.
- `scripts/verify_manifest.py` dependía de un manifiesto ausente del repositorio; se retira ese comando huérfano. Git y la comparación del build siguen aportando integridad.
- No había CODEOWNERS ni EditorConfig. Son ayudas, no controles remotos de permisos.

## Validación y límites

Los resultados de continuación se documentan en el PR #1 con comandos, SHA y URL del run, sin duplicar historiales de CI en archivos locales. La configuración importable de ramas queda en `branch-ruleset.json`; su activación permanece en issue #2 hasta verificarla por API. No se reclama revisión independiente ni cumplimiento exhaustivo de seguridad.
