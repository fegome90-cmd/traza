# Arquitectura de TRAZA clínica

El código es un prototipo local-first generado a un HTML autónomo desde módulos ES (`src/`).

```
expediente sintético y metadatos → engine.selectView(corte t, κ)
                                  → graph-data (nodos/aristas tipados)
                                  → graph-exploration (vecindad/ramas)
                                  → graph-layout (posiciones deterministas)
                                  → graph-view (Canvas 2D y gestos)
                                  → graph-panel y app (fuente bajo demanda)
```

**Invariantes de dominio:** `S_t` (estado del paciente) no se observa en la aplicación. El objeto real de estudio es el estado documental disponible bajo una tarea y corte. Las raíces se comparten sin multiplicar la observación; una copia no rejuvenece la evidencia; `t` (tiempo clínico) y `κ` (disponibilidad) son distintos. Instrucciones, relatos, acciones y observaciones no se fusionan automáticamente. Las citas mantienen offsets hacia texto original y se pueden verificar desde el inspector.

**Artefactos y alcance:** `src/engine.mjs` es fuente de verdad del dominio. `src/graph-*.mjs` nunca edita el expediente; filtra visualmente solo lo ya permitido por `selectView`. `src/ui` contiene presentación, `tests/` invariantes, `data/` muestras con atribución, `dist/index.html` la compilación reproducible.

**Decisión de visor:** Canvas 2D propio, navegación local/global y expansión progresiva, inspirado en las interacciones de Quartz/Obsidian. No copia el renderer propietario de Obsidian ni usa dependencias de G6. Véase `docs/UPSTREAM.md`.
