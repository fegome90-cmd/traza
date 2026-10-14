# Contribuir a TRAZA

TRAZA es un laboratorio de grafos documentales, **no software clínico validado**. Aceptamos casos sintéticos con procedencia/licencia verificable; nunca fichas clínicas reales.

1. Lee [`AGENTS.md`](AGENTS.md) y la [constitución](docs/governance/AGENTIC-CONSTITUTION-v1.0.md), y consulta las decisiones en `docs/`.
2. Trabaja sobre `develop` en una rama por tarea. Declara alcance, riesgo, validación y criterios de aceptación en el PR. Usa worktree para cambios que no sean triviales.
3. Antes de solicitar revisión, ejecuta `npm run check && npm test && npm run build` y `git diff --check`; para cambios de UI adjunta evidencia visual.
4. Actualiza README/documentación si cambia un contrato, formato, comando, esquema o interacción. Mantén los textos y su procedencia íntegros.
5. Solicita revisión separada de quien implementó. Si faltan validaciones o autoridad, no marques listo para merge.

Se preservan licencias y atribuciones de los datasets. El directorio `licenses/` contiene la licencia MIT limitada de los módulos de Graph View; **no existe una licencia global concedida automáticamente para toda la aplicación o datos**.
