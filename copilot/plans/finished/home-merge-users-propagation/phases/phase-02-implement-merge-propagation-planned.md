# Phase 02 — Implement Merge Propagation (COMPLETED)

## Objective
Aplicar propagación de compartición al subárbol de la carpeta compartida destino al confirmar "fusionar usuarios".

## Implemented changes
- Agregar helper para calcular subárbol y sincronizar `sharedWith`/`sharedWithUids` en carpetas descendientes y asignaturas.
- Reusar helper en todos los `onMergeConfirm` existentes del archivo.

## Completion notes
- Se añadió `syncSharedStateToFolderTree` y se invocó en las tres ramas `onMergeConfirm` del Home handler.
- `mergeTargetFolderShares` ahora retorna el set fusionado para sincronización posterior.

## Risks
- Escrituras adicionales en lote secuencial; vigilar errores de Firestore.
- Evitar cambios en ramas no relacionadas.
