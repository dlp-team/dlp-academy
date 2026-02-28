# Home Merge Users Propagation

## Problem statement
Cuando el usuario elige **"Mover y fusionar usuarios"** al mover contenidos a una carpeta compartida, hoy se fusionan usuarios en la carpeta destino, pero no siempre se sincronizan los elementos ya contenidos dentro de esa carpeta compartida.

## Scope
- Ajustar el flujo de `onMergeConfirm` en Home para que, tras fusionar usuarios en carpeta destino, se propague ese set de compartición a carpetas hijas y asignaturas dentro del árbol de destino.
- Mantener los demás flujos (`onConfirm`, unshare, shortcuts, permisos, overlays) sin cambios de comportamiento.

## Non-goals
- No refactor de arquitectura de permisos.
- No migración de modelo de datos a herencia dinámica completa.
- No cambios en UI/UX de modales.

## Current status summary
- Estado: ACTIVE
- Implementación aplicada en `src/pages/Home/hooks/useHomePageHandlers.js` para propagar compartición en `onMergeConfirm`.
- Próximo paso: validación final + reporte lossless + paso a `inReview`.

## Key decisions and assumptions
- Se mantendrá el modelo actual (arrays `sharedWith` / `sharedWithUids` en documentos).
- La propagación se ejecutará únicamente en la rama explícita de "fusionar usuarios" para evitar scope drift.
- Se privilegiará dif mínimo y compatibilidad hacia atrás.
