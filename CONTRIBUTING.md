# Contribuir a TRAZA

TRAZA es un laboratorio de grafos documentales, **no software clínico validado**. Sólo se aceptan casos sintéticos con procedencia y licencia verificables.

1. Lee `AGENTS.md`, la constitución íntegra y las decisiones en `docs/`.
2. Crea rama por tarea desde `develop` y worktree aislado. Sólo omite worktree bajo las tres condiciones de Ley IV, art. 3, documentadas en `AGENTS.md`.
3. Declara intención, alcance, riesgo, validación y reversibilidad en el PR. Si cambias código fuente, ejecuta `npm run build`; después `npm run verify` y `git diff --check`.
4. Para UI ejecuta `npm run test:e2e` con Playwright/Chromium instalado y revisa las capturas; no presentes dobles de prueba como renderizado real.
5. Actualiza contratos y documentación afectados. Abre PR a `develop` y solicita revisión independiente. Sólo `develop` de este repositorio se promociona a `main` mediante PR.

## Controles locales

`npm run lint` comprueba estructura, archivos sensibles y patrones comunes de secretos; no es un escáner exhaustivo. `npm run format:check` verifica LF, salto final y espacios finales, sin reescribir corpus ni constitución. `npm run check` valida sintaxis de todo JS/Python y JSON versionado. No se atribuye un typecheck estático de dominio a JavaScript sin tipos.

El hook local opcional bloquea pushes directos a `main`/`develop`. Para instalarlo en tu clon, tras revisar su código:

```bash
chmod +x .githooks/pre-push
git config --local core.hooksPath .githooks
```

No reemplaces un `core.hooksPath` ya existente sin revisar cómo integrarlo. El hook es opt-in y no protege escrituras por API. La activación de reglas reales de GitHub se sigue en issue #2.

Las licencias y atribuciones originales se mantienen. MIT en `licenses/` cubre sólo los módulos indicados del visor; no hay licencia global concedida a toda la aplicación, constitución o datasets.
