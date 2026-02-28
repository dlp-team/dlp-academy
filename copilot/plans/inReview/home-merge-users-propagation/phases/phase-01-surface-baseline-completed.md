# Phase 01 — Surface & Baseline (COMPLETED)

## Objective
Identificar superficie exacta de cambio para "fusionar usuarios" y zonas de alto riesgo de regresión.

## Changes
- Se localizaron ramas `onMergeConfirm` en `src/pages/Home/hooks/useHomePageHandlers.js`.
- Se verificó que actualmente se fusiona en carpeta destino pero no hay sincronización explícita de todo el subárbol.

## Risks
- Romper permisos de escritura/lectura fuera de ramas de merge.
- Alterar flows de `onConfirm` o `unshare` por cambios globales.

## Completion notes
- Cambio acotado a rama de merge confirmado.
