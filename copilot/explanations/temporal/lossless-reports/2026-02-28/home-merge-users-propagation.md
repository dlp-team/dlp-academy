# Lossless Report — home-merge-users-propagation

## Timestamp
- 2026-02-28

## 1) Requested scope
- Al usar "Mover y fusionar usuarios" en Home, además de fusionar usuarios en carpeta destino, actualizar elementos dentro de esa carpeta compartida para que queden compartidos con el mismo conjunto de usuarios.

## 2) Out-of-scope behavior explicitly preserved
- No cambios en `onConfirm` estándar (sin merge).
- No cambios en flujos de `unshare`.
- No cambios en permisos de edición/visualización fuera de la rama merge.
- No cambios de UI de modales ni overlays.

## 3) Touched files list
- src/pages/Home/hooks/useHomePageHandlers.js

## 4) Per-file verification list
### File: src/pages/Home/hooks/useHomePageHandlers.js
- Why touched: implementar propagación de compartición al subárbol en rama explícita de merge.
- Reviewed items:
  - `mergeTargetFolderShares` -> ahora retorna `mergedUids` y `mergedSharedWith` además de actualizar carpeta destino.
  - `syncSharedStateToFolderTree` -> helper nuevo que recorre subárbol de carpetas y sincroniza `sharedWith`/`sharedWithUids` en carpetas descendientes y asignaturas contenidas.
  - `onMergeConfirm` (subject move mismatch) -> invoca merge + sync + move.
  - `onMergeConfirm` (folder move mismatch en breadcrumb) -> invoca merge + sync + move.
  - `onMergeConfirm` (folder nest mismatch) -> invoca merge + sync + move.
  - Ramas adyacentes `onConfirm`, `unshareConfirm`, atajos y permisos -> no modificadas.
- Result: ✅ preserved

## 5) Risks found + how they were checked
- Riesgo: scope drift en flujos no-merge.
  - Check: el diff se limita a helpers de merge y callbacks `onMergeConfirm`.
- Riesgo: errores de compilación por nuevas referencias.
  - Check: diagnóstico en archivo tocado sin errores.
- Riesgo: desalineación parcial en subárbol.
  - Check: el helper incluye BFS sobre carpetas hijas y actualización de subjects cuyo `folderId` pertenece al subárbol.

## 6) Validation summary
- `get_errors` sobre `src/pages/Home/hooks/useHomePageHandlers.js`: sin errores.
- Runtime check manual: pendiente (requiere interacción UI en flujo de drag/move con merge).
