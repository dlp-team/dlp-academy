# Cards — Guía de Patrones UI

> Última actualización: 2026-04-28 — Phase 6 of institution-admin-platform-improvements-apr-2026

---

## Card Estándar (Datos / Contenido)

Usada para secciones de contenido, tarjetas de datos, bloques de información.

```tsx
<div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
  {/* contenido */}
</div>
```

**Características:**
- `rounded-2xl` — bordes redondeados grandes
- `border border-slate-200 dark:border-slate-700` — borde sutil temático
- `bg-white dark:bg-slate-900` — fondo del card temático
- `p-5` — padding interior estándar
- `shadow-sm` — sombra sutil (sin sombra en hover por defecto)

---

## Card Interactiva (con Hover)

Para cards que son clicables o tienen estados de hover visuales.

```tsx
<div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
  {/* contenido */}
</div>
```

**Añadidos:**
- `overflow-hidden` — evita que contenido interno rompa bordes redondeados
- `hover:shadow-md` — sombra aumenta en hover
- `transition-shadow duration-200` — transición suave

---

## Card de Modal / Overlay Interno

Para el panel interno dentro de un `DashboardOverlayShell` o `BaseModal`.

```tsx
// Generado automáticamente por DashboardOverlayShell
<div className="relative w-full max-w-{size} max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
```

**Diferencias respecto a card estándar:**
- `shadow-2xl` en lugar de `shadow-sm`
- `overflow-y-auto` — scroll habilitado
- Ancho y altura máximos controlados por props de `DashboardOverlayShell`

---

## Card de Alerta / Confirmación (inline)

Para mensajes de confirmación dentro de modales secundarios.

```tsx
<div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-5">
  <h4 className="text-base font-semibold text-slate-900 dark:text-white">Título</h4>
  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Descripción.</p>
</div>
```

---

## Card de Sección (bordes y padding reducidos)

Para bloques de sección dentro de un panel ya existente.

```tsx
<section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
    Título sección
  </h3>
  {/* contenido */}
</section>
```

---

## Card de Selección / Modo Seleccionado

Para cards que tienen estado seleccionado activo.

```tsx
// Estado normal
<div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 cursor-pointer transition-colors">

// Estado seleccionado
<div className="rounded-2xl border border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 p-4 cursor-pointer ring-2 ring-indigo-500/30">
```

---

## Badges dentro de Cards

Para etiquetas de estado o tipo en cards.

```tsx
// Badge de estado (verde)
<span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-400/20 px-2 py-0.5 text-[11px] font-semibold">
  Activo
</span>

// Badge genérico
<span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold {colorClasses}">
  {label}
</span>
```

---

## Tabla de Variantes Rápida

| Variante | `rounded` | `shadow` | `p` | Hover |
|----------|-----------|----------|-----|-------|
| Estándar | `2xl` | `sm` | `p-5` | — |
| Interactiva | `2xl` | `sm` → `md` | `p-5` | `hover:shadow-md` |
| Modal | `2xl` | `2xl` | — (DashboardOverlayShell) | — |
| Sección | `xl` | — | `p-4` | — |
| Seleccionada | `2xl` | — | `p-4` | `ring-2` |

---

## ❌ Anti-patrones

| Prohibido | Por qué |
|-----------|---------|
| `rounded-lg` en cards principales | Inconsistente con el sistema (usar `rounded-xl` o `rounded-2xl`) |
| `shadow-lg` en cards normales | Reservado para dropdowns y tooltips |
| `bg-slate-100` en card estándar | Usar `bg-slate-50` solo en secciones secundarias |
| `border-2` en cards de datos | El borde simple es el estándar |

---

## Ver también

- [buttons.md](./buttons.md) — Botones dentro de cards
- [states.md](./states.md) — Empty/loading states dentro de cards
- `src/components/modules/FolderCard/FolderCardBody.tsx`
- `src/pages/Topic/components/TopicContent.tsx`
