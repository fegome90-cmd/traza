# Registro de cambios

## 0.3.0 — 2026-10-13

- Reemplazado visor G6 dependiente de CDN por Canvas 2D autónomo, sin dependencias de red.
- El grafo pasa a ser la superficie principal: los paneles de fuente y detalle se cierran al inicio y se abren bajo demanda.
- Nodos circulares, aristas tenues, etiquetas sin colisión, zoom/arrastre, búsqueda y alternancia Local/Global.
- Expansión/contracción por rama y límites de ocho vecinos por nivel para fuentes muy conectadas.
- Conservación del motor documental y de filtros `t`/`κ` sin cambios.
- Nuevas pruebas de expansión, geometría, integración y corpus grande.

## 0.2.0 — historial

- Intento anterior con adaptador para G6 y pruebas de contrato. El render real de G6 no quedó verificado debido al CDN bloqueado. Esta versión no incluye G6 ni descarga externa alguna.
