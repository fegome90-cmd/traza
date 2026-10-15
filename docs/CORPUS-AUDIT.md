# Fuente externa y auditoría del corpus

Fecha de inspección: 13 de octubre de 2026. Este documento distingue el estudio publicado, los metadatos del depósito, el texto inspeccionado y los archivos realmente incluidos.

## Artículo

Conway A, Hada A, Schluter J, Xu HG, Lowden D, Miller T, Donald K, Teodorczuk A. AI-Based Structured Information Extraction From Synthetic Nursing Handover Transcripts: Comparative Evaluation of Large Language Models. JMIR Nursing. 2026;9:e106133. Publicado el 5 de octubre de 2026. DOI: 10.2196/106133.

Fuente primaria: https://nursing.jmir.org/2026/1/e106133

El artículo evalúa 203 transcripciones sintéticas con anotaciones de dos enfermeras/os y consenso. Distingue SBAR, detección de contenidos y expresiones de incertidumbre. Reporta F1 micro de 0,41 para detección amplia de incertidumbre por GPT-5.2 optimizado; es un resultado de los autores, no de TRAZA. El estudio no demuestra efectividad ni seguridad clínica. Sus 100 transcripciones adaptadas de NICTA fueron transformadas a conversaciones; no son automáticamente intercambiables con los perfiles y textos originales.

## Depósito observado

API oficial consultada mediante Firecrawl: https://api.figshare.com/v2/articles/32658084

DOI: 10.6084/m9.figshare.32658084.v1. Autor: Aaron Conway. Versión 1, publicada el 12 de junio de 2026. Licencia indicada: CC BY 4.0.

La respuesta observada enumera un único archivo, `tpch_text_values.md`, ID 65497158, tamaño 184927 bytes. Dirección de descarga publicada: https://ndownloader.figshare.com/files/65497158

Los campos `supplied_md5` y `computed_md5` informados por la API fueron ambos `710e27e24c924b87968543a9f831e5ef`. **Son metadatos del servidor. No se verificó ese hash contra una copia binaria descargada en esta entrega.**

La enumeración de archivos no muestra anexos separados de anotaciones o código. El texto completo servido se pudo leer mediante Firecrawl y mostró diálogos; no se localizaron allí anotaciones de consenso ni scripts de evaluación. Esto no prueba que esos materiales no existan en otra versión o ubicación.

## Qué se incluye

Tres diálogos completos seleccionados del texto recuperado:

- FIG-005: incertidumbre y escalamiento.
- FIG-007: transferencia para imagenología.
- FIG-008: transferencia desde urgencias.

Los títulos de navegación son nuestros; los textos ingleses se conservaron sin traducción. Los índices identifican su posición en la inspección del material, no pacientes ni episodios validados. Los tres textos se encuentran en `data/figshare-selected-3.md`; atribución y metadatos en el JSON adjunto. El HTML contiene la misma muestra. No contiene el archivo Figshare completo ni los otros 100 casos del estudio.

El recuento de **103** corresponde a la auditoría aportada por Felipe. No se presenta aquí como un recuento programático independiente del archivo original, porque no se obtuvo y verificó su copia binaria. Sí se comprobó que el archivo de muestra incluido se separa en exactamente **3** casos, conserva sus textos y genera estructuras válidas sin inventar tiempos o raíces. El importador contará los casos del original cuando el usuario lo cargue.

## Lo que no es una anotación

La segmentación por interlocutor y las coincidencias de expresiones como “not sure”, “I think” o “pending” no son gold, no son exhaustivas y no permiten calcular F1 contra las etiquetas originales. No inferimos desconocimiento clínico de la ausencia de una expresión. Tampoco se convierte cada turno de habla en un hecho atómico.

Los nombres repetidos no permiten por sí solos establecer identidad de paciente o trayectoria. El programa no fusiona casos ni prepara un split de entrenamiento aleatorio. Una evaluación futura exige identificadores de identidad/episodio adjudicados y particiones agrupadas cuando corresponda.

## NICTA/CSIRO

No se incluyeron archivos de NICTA/CSIRO ni sus audios. La licencia CC BY-NC-ND 4.0 y el inventario descritos por Felipe no se sustituyeron por una autorización de redistribución. El prototipo admite texto sintético proporcionado por el usuario para comparar perfil, entrega y registro; no se afirma haber ejecutado ese benchmark.

## Estatus experimental

La matriz anotada de ejemplo fue construida para mostrar conservación, omisión y alteración de incertidumbre. No deriva de anotaciones publicadas ni constituye evidencia experimental sobre los 203 casos. Los resultados ejecutados en esta entrega son pruebas de implementación e invariantes y los ejemplos numéricos aislados del laboratorio.
