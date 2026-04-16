# Overlays — Guía de Patrones UI

> Última actualización: 2026-04-28 — Phase 6 of institution-admin-platform-improvements-apr-2026

---

## Regla de Posicionamiento (OBLIGATORIO)

**Todos los overlays deben quedar debajo del header fijo de la app.**

El header tiene una altura de `5rem` (variable CSS: `--app-fixed-header-height: 5rem`).  
La constante `OVERLAY_TOP_OFFSET_STYLE` encapsula el offset necesario:

```ts
// src/utils/layoutConstants.ts
export const OVERLAY_TOP_OFFSET_PX: number = 84;  // 5rem = 80px + 4px buffer
export const OVERLAY_TOP_OFFSET_STYLE: { top: string } = {
  top: `${OVERLAY_TOP_OFFSET_PX}px`
};
```

---

## Componente Estándar: `DashboardOverlayShell`

**Ruta:** `src/components/ui/DashboardOverlayShell.tsx`

Este es el componente canónico para todos los overlays/modales de la app. Wrappea `BaseModal` y aplica automáticamente el offset del header.

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | — | Controla visibilidad |
| `onClose` | `() => void` | — | Callback al cerrar |
| `maxWidth` | `'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'` | `'3xl'` | Ancho máximo del panel |
| `maxHeightClassName` | `string` | `'max-h-[calc(100vh-8rem)]'` | Altura máxima |
| `rootClassName` | `string` | — | Clases adicionales para el root |
| `rootStyle` | `CSSProperties` | `OVERLAY_TOP_OFFSET_STYLE` | Override del estilo de posición |
| `hasUnsavedChanges` | `boolean` | `false` | Activa guarda de cambios sin guardar |
| `confirmOnUnsavedClose` | `boolean` | `false` | Muestra confirmación al cerrar con cambios |
| `children` | `ReactNode \| (args) => ReactNode` | — | Contenido del overlay |

### Uso Estándar

```tsx
import DashboardOverlayShell from '../../components/ui/DashboardOverlayShell';

<DashboardOverlayShell
  isOpen={isOpen}
  onClose={handleClose}
  maxWidth="2xl"
>
  {/* contenido del overlay */}
</DashboardOverlayShell>
```

---

## Overlay Manual (sin `DashboardOverlayShell`)

Cuando un overlay requiere JSX directo (por ejemplo, `FolderTreeModal`) sin wrappers extra, usar exactamente este patrón:

```tsx
import { OVERLAY_TOP_OFFSET_STYLE } from '../../utils/layoutConstants';

<div
  className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto clean-scrollbar"
  style={OVERLAY_TOP_OFFSET_STYLE}
>
  {/* contenido */}
</div>
```

> **Nota:** El `clean-scrollbar` en el root oculta el scrollbar del contenedor externo. El scroll interno del panel debe usar `minimal-scrollbar`.

---

## Z-Index Levels

| Nivel | Valor | Uso |
|-------|-------|-----|
| Overlay principal | `z-50` | `DashboardOverlayShell`, overlays de página |
| Confirmación / sub-modal | `z-[60]` | Modal de confirmación de cambios sin guardar |
| Header | `z-40` | `Header.tsx` (siempre debajo de overlays) |

---

## Clases de Contenido Interno

El panel interno del overlay (generado por `DashboardOverlayShell`) usa:

```
relative w-full {widthClass} {maxHeightClass} overflow-y-auto
rounded-2xl border border-slate-200 dark:border-slate-700
bg-white dark:bg-slate-900 shadow-2xl
```

---

## ❌ Anti-patrones

| Prohibido | Por qué |
|-----------|---------|
| `top: 0` en un overlay | Queda debajo del header |
| `position: absolute` en root de overlay | Debe ser `fixed` |
| Omitir `style={OVERLAY_TOP_OFFSET_STYLE}` | El overlay tapa el header |
| Usar `z-10` o menos en overlays | El header (z-40) lo tapa |

---

## Ver también

- [scrollbars.md](./scrollbars.md) — Reglas de scrollbar para overlays
- `src/components/ui/DashboardOverlayShell.tsx`
- `src/utils/layoutConstants.ts`
