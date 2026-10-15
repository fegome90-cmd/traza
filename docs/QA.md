# Verificación v0.3.0 — estado real

**Ámbito:** integración del Graph View compacto en el expediente sintético de TRAZA. Se conservaron byte a byte `engine.mjs`, `extractor.mjs`, `fixtures.mjs`, `corpus.mjs`, `samples.mjs`, `comparison.mjs`, `export.mjs` respecto de v0.2.0.

## Reproducir

```bash
npm run check
npm test
python3 scripts/build.py
python3 tests/obsidian_browser.py
python3 tests/visual_capture.py
```

Los contadores finales están en `qa/unit-final.txt` y `qa/browser-results.json`. Los PNG muestran el navegador ejecutando Canvas 2D real, no una imagen generada ni un doble del motor. Playwright utilizó `set_content(HTML)` porque el host de prueba bloqueó la navegación `file://`; el script completo se ejecutó y produjo PNG reales.

## Casos cubiertos

- Vecindad local de un salto, expansión por nodo, dos niveles y reversión de una rama sin esconder nodos compartidos.
- Límite de ocho vecinos por nivel para nodos de grado elevado; Global no aplica ese límite.
- Renderizador determinista, geometría finita, preservación de posiciones arrastradas y transformaciones cámara/pantalla reversibles.
- Paneles ocultos al inicio y abiertos por demanda, vínculo a cita literal fuente; layout móvil tipo hoja inferior.
- Corte documental 12:30 (2 afirmaciones), 13:05 (3), 20:05 (4), sin usar datos que llegan posteriormente.
- Importación reproducible del caso sintético ACI incluido en `data/ACI-consulta-y-nota.json` y navegación local/global sobre 98 nodos / 96 aristas.
- Exportación PNG de Canvas y JSON de expediente.
- Ausencia de solicitudes externas durante las pruebas de escritorio y móvil.

## Límites pendientes

- Sin evaluación con pacientes, sin extracción NLP de texto libre validada.
- No se ejecutó en Safari móvil real, no se probó VoiceOver ni multitáctil físico.
- No hay análisis formal de complejidad/render con decenas de miles de nodos; el experimento verificado llegó a 98.
- Las pruebas no certifican que el diseño sea literalmente el Graph View propietario de Obsidian. Es una implementación funcional original con la misma lógica local/global y expansión por demanda.
