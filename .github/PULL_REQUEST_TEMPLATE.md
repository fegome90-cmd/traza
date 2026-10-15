## Objetivo y alcance

¿Qué cambia y qué queda explícitamente fuera?

## Riesgo y contratos

- Riesgo: bajo / medio / alto (justificar).
- ¿Modifica `t`, `κ`, raíces, procedencia, fuente, importación o formato? ¿Cómo se verificó?
- ¿Toca permisos, CI, políticas, secretos, despliegue, persistencia o infraestructura? Añadir autorización humana trazable antes de ejecutar acciones sensibles.

## Evidencia

- [ ] Leí contexto relevante y evité duplicaciones.
- [ ] `npm run check` aprobado.
- [ ] `npm test` aprobado.
- [ ] `npm run build` reproducible.
- [ ] UI validada en navegador si aplica (captura/ruta/observación).
- [ ] Sin datos reales, secretos ni archivos temporales.
- [ ] Actualicé documentación de contratos y límites.
- [ ] Revisé diffs, simplificación y coherencia con la intención.
- [ ] Revisión independiente solicitada antes del merge.

## Riesgos pendientes / decisión de promoción

Registrar bloqueos, excepciones con vencimiento, evidencia y estado GO / NO-GO. No afirmar validaciones no ejecutadas.
