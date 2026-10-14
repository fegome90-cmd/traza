# Fuentes open source y decisión de integración

Revisión al 13 de octubre de 2026.

| Proyecto | Licencia comprobada | Código/idea estudiados | Integración en TRAZA |
|---|---|---|---|
| Quartz Community Graph | MIT, copyright (c) 2026 Quartz Community. [LICENSE](https://github.com/quartz-community/graph/blob/main/LICENSE) | `src/components/scripts/graph.inline.ts` (grafo local/global; simulación D3 + render PixiJS) y `Graph.tsx` | **Referencia funcional y de interacción, no dependencia ni código copiado.** El original espera `fetchData`, slugs, `contentIndex.json`, utilitarios y un CDN. |
| Expansive Local Graph | MIT, copyright (c) 2026 Kolpa4. [LICENSE](https://github.com/Kolpa4/Expansive-local-graph/blob/main/LICENSE) | `main.ts`: acciones Expand/Reduce/Reset por rama, nodos overlay y posiciones relativas | **Referencia de expansión selectiva, no módulo integrado.** El original usa `obsidian`, monkey-patching y renderer nativo privado. |
| TRAZA — módulos propios v0.3 | MIT, [`licenses/GRAPH-VIEW-MIT.txt`](../licenses/GRAPH-VIEW-MIT.txt) | Proyección local/global, expansión acotada, layout y Canvas 2D | Código fuente entregado y ejecutable totalmente offline. |

**No se afirmó usar el renderer propietario de Obsidian.** No se incorporó una biblioteca gráfica no verificable ni se requieren dependencias remotas. Las muestras de corpus no quedan relicenciadas por el MIT de los módulos de software.

El algoritmo de visibilidad de TRAZA preserva siempre aristas direccionadas; la navegación utiliza vecindad no dirigida sólo para decidir qué conexiones explorar. Cada proyección se calcula exclusivamente después de `selectView` y nunca reemplaza el texto fuente ni reescribe el expediente.
