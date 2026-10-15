# Atribución y materiales

## Fuente conceptual

Método FALP. *Hacia una teoría del estado documental clínico: representación situada, tiempo, procedencia e inferencia para aprendizaje automático*. Manuscrito matemático y dossier de verificación. Compilación editorial LaTeX v0.3, 13 de octubre de 2026. Documento aportado por Felipe; se leyó íntegramente para el diseño. El PDF y sus adjuntos no se redistribuyen en este paquete.

## Diálogos externos incluidos

Conway, Aaron (2026). *Large Language Models for Structured Information Extraction in Artificial Intelligence-Assisted Clinical Handover: Evaluation Study*. Figshare. Dataset, versión 1. DOI: **10.6084/m9.figshare.32658084.v1**.

Fuente: https://doi.org/10.6084/m9.figshare.32658084.v1
Archivo servido: https://ndownloader.figshare.com/files/65497158
Licencia: **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
Texto de la licencia: https://creativecommons.org/licenses/by/4.0/

Se seleccionaron tres diálogos completos del texto recuperado por Firecrawl. No se tradujeron; se agregaron identificadores y títulos de navegación y una segmentación por interlocutor, todos separados del texto fuente. No se obtuvieron ni redistribuyeron anotaciones de consenso o código de los autores. No se afirma respaldo de los autores, JMIR, CSIRO, NICTA ni FALP institucional a este prototipo.

## Fixture de conversación y nota de ACI-Bench

Se incluye únicamente una muestra de entrenamiento (`data/ACI-consulta-y-nota.json`), identificador de origen `D2N001-virtassist`, con la conversación y su nota de consulta asociada, usadas para reproducir la prueba de importación con 98 nodos. **No es una entrega de enfermería ni una referencia de verdad fisiológica.** El JSON fue adaptado para TRAZA en una transformación identificada como `adapter`; conserva los textos fuente y los fragmentos utilizados, sin validación clínica de las anotaciones automáticas.

Fuente: [ACI-Bench — Microsoft Research y colaboradores](https://github.com/wyim/aci-bench); [depósito oficial](https://figshare.com/articles/dataset/aci-bench-corpus_zip/22494601); [publicación en Scientific Data](https://www.nature.com/articles/s41597-023-02487-3). **Licencia de los datos: CC BY 4.0**: https://creativecommons.org/licenses/by/4.0/ . No se afirma respaldo institucional de Microsoft a TRAZA. Se incorpora como fixture reproducible, no como conjunto exhaustivo del estudio.

La licencia de los diálogos no se extiende automáticamente al resto de documentos del usuario. Los materiales NICTA no están incluidos. El código nuevo fue generado para este encargo; este archivo no decide una licencia de publicación para el proyecto de Felipe.
