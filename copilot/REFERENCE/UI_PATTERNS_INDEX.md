# UI_PATTERNS_INDEX — Índice de Patrones de UI

> Generado: 2026-04-28 — Phase 6 of institution-admin-platform-improvements-apr-2026

Este índice es la referencia rápida canónica para todos los patrones de UI de DLP Academy.  
**Antes de crear cualquier elemento de UI**, consultar este índice y el archivo correspondiente.

---

## Índice Rápido por Tarea

| Necesito… | Ir a |
|-----------|------|
| Crear un overlay/modal que quede debajo del header | [overlays.md](./ui-patterns/overlays.md) |
| Elegir qué clase de scrollbar usar | [scrollbars.md](./ui-patterns/scrollbars.md) |
| Crear una tarjeta de datos o contenido | [cards.md](./ui-patterns/cards.md) |
| Agregar un botón (primario/secundario/danger/ghost) | [buttons.md](./ui-patterns/buttons.md) |
| Construir un formulario o un campo de input | [forms.md](./ui-patterns/forms.md) |
| Mostrar estado vacío, carga o error | [states.md](./ui-patterns/states.md) |
| Crear tabs, breadcrumbs o navegación lateral | [navigation.md](./ui-patterns/navigation.md) |

---

## Tabla de Patrones y Clases Clave

### Overlays

| Patrón | Clase / Componente clave |
|--------|-------------------------|
| Overlay estándar | `DashboardOverlayShell` |
| Offset del header | `OVERLAY_TOP_OFFSET_STYLE` (`top: 84px`) |
| Root de overlay | `fixed inset-x-0 bottom-0 z-50 overflow-y-auto` |
| Panel interno | `rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl` |
| Z-index overlay | `z-50` |
| Z-index sub-modal | `z-[60]` |

### Scrollbars

| Clase | Cuándo |
|-------|--------|
| `minimal-scrollbar` | Paneles internos con scroll |
| `clean-scrollbar` | Root de overlay/modal |
| `app-global-scrollbar` | Solo scroll de página |

### Cards

| Tipo | Clases clave |
|------|-------------|
| Estándar | `rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm` |
| Interactiva | + `hover:shadow-md transition-shadow duration-200` |
| Modal | + `shadow-2xl overflow-y-auto` |
| Sección | `rounded-xl ... p-4` |

### Botones

| Tipo | Clases clave |
|------|-------------|
| Primario | `bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-semibold` |
| Secundario | `border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800` |
| Danger | `bg-red-600 hover:bg-red-700 text-white` |
| Ghost | `text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg` |
| Icon-only | `p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100` |

### Formularios

| Elemento | Clases clave |
|----------|-------------|
| Input estándar | `w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500` |
| Input sutil (fondo gris) | `bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500` |
| Input con icono | `pl-9` + icono `absolute left-3` |
| Label | `text-sm font-medium text-slate-700 dark:text-slate-300` |
| Error de campo | `text-xs text-red-600 dark:text-red-400 mt-1` |

### States

| Estado | Elementos clave |
|--------|----------------|
| Loading pantalla | `animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600` |
| Loading sección | `Loader2 className="w-8 h-8 animate-spin"` |
| Loading botón | `Loader2 className="w-4 h-4 animate-spin"` |
| Empty state | `border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50` |
| Error inline | `bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700` |
| Success inline | `bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200` |

### Tabs

| Tipo | Activo | Inactivo |
|------|--------|---------|
| Pill | `bg-slate-900 dark:bg-slate-100 text-white border-slate-900` | `bg-white dark:bg-slate-900 text-slate-500 border-slate-200` |
| Underline | `text-indigo-600 border-b-2 border-indigo-600` | `text-slate-500 hover:text-slate-700` |

---

## Reglas Globales de UI

1. **Sin alertas del navegador** → usar texto o banners inline (`alert()`/`confirm()` prohibidos)
2. **Sin emojis en UI** → usar iconos de `lucide-react`
3. **Todo texto visible en español** → ningún label/placeholder/mensaje en inglés
4. **No hardcodear colores** → usar clases Tailwind de la paleta `slate/indigo/red/emerald/amber`
5. **Accesibilidad mínima** → `aria-label` en icon buttons, `role="tablist"` en tabs
6. **Política de cursor** → `cursor: pointer` se aplica globalmente vía `src/index.css` a `button`, `[role="button"]`, `a[href]`, `summary`, `select`, `input[type="checkbox"]`, `input[type="radio"]`, y `[data-clickable="true"]`. Para `<div>` u otros elementos no semánticos con `onClick`, agregar `cursor-pointer` en className manualmente. Estados deshabilitados usan `cursor-not-allowed` automáticamente.

---

## Archivos Fuente de Referencia

| Patrón | Archivo real |
|--------|-------------|
| Overlay estándar | `src/components/ui/DashboardOverlayShell.tsx` |
| OVERLAY_TOP_OFFSET | `src/utils/layoutConstants.ts` |
| Scrollbar CSS | `src/index.css` líneas 211–310 |
| Tabs Pill | `src/pages/Topic/components/TopicTabs.tsx` |
| Tabs Underline | `src/pages/Subject/modals/SubjectFormModal.tsx` |
| Formulario settings | `src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx` |
| Empty state | `src/pages/Topic/components/TopicContent.tsx` |
| Loading spinner app | `src/App.tsx` línea 175 |
| Pagination buttons | `src/components/ui/TablePagination.tsx` |
| Modal submit button | `src/components/modals/shared/ModalGradientSubmitButton.tsx` |
