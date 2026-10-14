# TRAZA clínica — Graph View local v0.3.0

**Aplicación ejecutable con un solo HTML y sin dependencias de red.** Esta versión cambia únicamente la experiencia del grafo: nodos circulares, aristas discretas y navegación por vecindades con expansión progresiva, al estilo del Graph View local de Obsidian/Quartz. Mantiene el análisis documental de TRAZA v0.1/v0.2.

> **Investigación con datos sintéticos.** No es un producto asistencial, una prueba de validez clínica ni un extractor NLP validado. No ingresar datos de pacientes reales.

## Abrir y ejecutar

- **`dist/index.html`**: aplicación standalone; abrir con Chrome, Firefox, Safari u otro navegador moderno. No se necesita servidor, API, CDN, npm, D3 ni PixiJS para usarla. Si un visor de archivos bloquea JavaScript, abre el archivo en un navegador normal.
- **`qa/local-desktop.png` y `qa/local-mobile.png`**: capturas de Chromium real para revisar el diseño sin abrir HTML.
- **`qa/expanded-desktop.png` / `qa/with-source-mobile.png`**: expansión y apertura de la fuente.
- **`data/ACI-consulta-y-nota.json`**: fixture sintético de ACI-Bench para la prueba de importación, incluido de forma independiente, con atribución en `docs/ATTRIBUTION.md`.

Para regenerar el HTML desde los módulos:

```bash
python3 scripts/build.py
npm test
npm run check
```

La única dependencia para construirlo es Python 3.10+; las pruebas Node necesitan Node 18+. El test de interfaz usa Playwright + Chromium:

```bash
python3 tests/obsidian_browser.py
python3 tests/visual_capture.py
```

Los scripts del navegador cargan el **mismo HTML real** mediante `page.set_content()`: en este entorno se bloquea la navegación a `file://`. No son capturas generadas ni pruebas con un motor gráfico simulado.

## Uso

1. Entra a **Grafo → Local**. Se muestra una afirmación y sus vecinos directos dentro de la vista del corte clínico `t` y disponibilidad `κ`.
2. Selecciona un nodo con un clic/toque para resaltar sus conexiones. El control inferior muestra el identificador, tipo y número de conexiones visibles.
3. **Expandir +N** descubre vecinos adicionales de esa rama; **Contraer −1** revierte un nivel sin eliminar conexiones que también sean visibles por otras ramas. Doble clic sobre un nodo equivale a expandir.
4. **Ver fuente** abre un panel lateral o una hoja inferior móvil con el fragmento exacto resaltado. **Detalle** muestra modalidad, sujeto, tiempos y procedencia. Ambos empiezan cerrados.
5. **Buscar** funciona sobre todos los nodos disponibles en el corte, incluidos los ocultos por navegación; al elegir un resultado lo convierte en centro local.
6. **Global** muestra todo el grafo de la *vista documental filtrada*, no todo el expediente sin importar el corte. Para volver a explorar por partes, selecciona **Local**.
7. Arrastra el fondo para desplazar, un nodo para reposicionarlo, usa rueda o botones para zoom. El diseño incluye gesto de pinza táctil; no se ha ensayado en Safari/iOS real. **Ajustar** restablece el encuadre.

La expansión de un nodo de grado muy alto se incorpora en **lotes de ocho vecinos** para evitar que una fuente con decenas de frases se despliegue de golpe. Local y Global sólo cambian visualización; las aristas originales conservan su dirección y su fuente. Un contador informa cuántos nodos y aristas permanecen ocultos en la vista local.

## Arquitectura

```text
src/engine.mjs          selectView(bundle, actor, q, t, κ)
        ↓
src/graph-data.mjs      Nodos/aristas/raíces tipados sin transformar fuentes
        ↓
src/graph-exploration.mjs   Local, Global, ramas y lotes de visibilidad
        ↓
src/graph-layout.mjs   Distribución determinista ligera
        ↓
src/graph-view.mjs    Renderizador Canvas 2D + zoom/arrastre/toque
        ↓
src/graph-panel.mjs   Controles y enlace con inspector/fuente
        ↓
src/app.mjs           App y expediente original
```

La fuente narrativa, los tres tiempos relevantes y los metadatos no se recalculan en el visor. La proyección conserva lo que `selectView` permite conocer hasta el corte `κ`; no convierte copia documental en observación, orden en ejecución ni la cercanía de nodos en contradicción.

## Por qué no se copió directamente el plugin de Obsidian

Se estudiaron dos proyectos **MIT**: [quartz-community/graph](https://github.com/quartz-community/graph) y [Kolpa4/Expansive-local-graph](https://github.com/Kolpa4/Expansive-local-graph). Quartz depende del `contentIndex.json` y de las bibliotecas D3 y PixiJS cargadas desde CDN; Expansive modifica el renderer y APIs internas de Obsidian. **No son componentes independientes copiables directamente a TRAZA.**

Esta versión aplica **sus patrones de interacción**, pero implementa el renderer y las expansiones como módulos propios Canvas 2D, sin copiar el código de Quartz/Expansive y sin bibliotecas de terceros en ejecución. No debe describirse como «port literal D3 + PixiJS», «código de Obsidian» ni como un fork de esos repositorios. Ver [`docs/UPSTREAM.md`](docs/UPSTREAM.md) para licencias y razones de ingeniería.

## Alcance de las pruebas

- Node: todas las pruebas en `tests/*.test.mjs`, incluyendo extracción, reconciliación, filtrado por tiempo, proyección, expansión y lote de nodos.
- Chromium real: desktop/móvil, fuente, inspector, búsquedas, Global/Local, expansión, corte temporal, importación ACI (96 afirmaciones/98 nodos), PNG del Canvas y ausencia de tráfico de red.
- Sin verificación real: Safari/iOS, VoiceOver, pinza multitáctil en dispositivo físico, bases masivas y validación clínica.

Los datos sintéticos distribuidos mantienen atribuciones y licencias independientes; ver `docs/ATTRIBUTION.md`. No se han incorporado pacientes reales ni nuevas reglas clínicas.

## Desarrollo gobernado

Lee [AGENTS.md](AGENTS.md), [CONTRIBUTING.md](CONTRIBUTING.md) y la [adopción constitucional](docs/governance/ADOPTION.md). CI utiliza las versiones de `.nvmrc` y `.python-version`. No hay dependencias npm de ejecución.

```bash
npm run verify
```

Verifica formato textual, estructura/secretos comunes, sintaxis, pruebas de dominio, pruebas de gobernanza y que `dist/index.html` coincida con `src`. La verificación no sobrescribe el HTML; para actualizarlo, ejecuta `npm run build`. El servidor opcional `npm run serve` escucha sólo en localhost.

Las protecciones de ramas se siguen en [issue #2](https://github.com/fegome90-cmd/traza/issues/2): políticas, CODEOWNERS y CI no las activan automáticamente. La aplicación se integra mediante PR a `develop`; `main` recibe promociones revisadas.
