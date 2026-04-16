# States — Guía de Patrones UI

> Última actualización: 2026-04-28 — Phase 6 of institution-admin-platform-improvements-apr-2026

---

## Loading (Pantalla Completa)

Para estados de carga de página completa o de view principal.

```tsx
// Spinner centrado en pantalla completa
<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Cargando...</p>
</div>
```

---

## Loading (Panel / Sección)

Para estados de carga dentro de un card o sección más pequeña.

```tsx
<div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 gap-2">
  <Loader2 className="w-8 h-8 animate-spin" />
  <span className="text-sm">Cargando...</span>
</div>
```

---

## Loading (Botón)

Ver [buttons.md](./buttons.md) sección "Con Loading Spinner".

```tsx
<button disabled={isLoading} className="...">
  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
  {isLoading ? 'Guardando...' : 'Guardar'}
</button>
```

---

## Empty State (Lista Vacía)

Para listas, grillas o secciones sin contenido disponible.

```tsx
<div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50">
  <Icon className="w-10 h-10 mb-3 opacity-40" />
  <p className="text-sm font-medium">No hay contenido</p>
  <p className="text-xs mt-1 opacity-70">Crea el primer elemento para comenzar.</p>
</div>
```

---

## Empty State (Vista Completa)

Para páginas o vistas que no tienen datos y requieren más espacio visual.

```tsx
<div className="min-h-[40vh] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6 text-center">
  <Icon className="w-14 h-14 mb-4 opacity-30" />
  <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">
    Sin resultados
  </h3>
  <p className="text-sm max-w-xs">
    No se encontraron elementos que coincidan con tu búsqueda.
  </p>
  <button className="mt-6 ...">{/* CTA opcional */}</button>
</div>
```

---

## Error State

Para cuando una operación falla y hay que mostrar el error al usuario.

```tsx
// Error inline (no usar alert())
<div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
  <AlertCircle className="w-4 h-4 flex-shrink-0" />
  <p className="text-sm">{errorMessage}</p>
</div>

// Error de campo (ver forms.md)
<p className="text-xs text-red-600 dark:text-red-400 mt-1">{fieldError}</p>
```

---

## Success State / Feedback Positivo

Para confirmar que una acción fue exitosa (sin alertas).

```tsx
// Toast / notificación inline
<div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
  <p className="text-sm">Cambios guardados correctamente.</p>
</div>
```

---

## Warning State

```tsx
<div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
  <p className="text-sm">{warningMessage}</p>
</div>
```

---

## Skeleton Loading (Placeholder)

Para cards o listas que cargan con shape conocido.

```tsx
// Card skeleton
<div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 animate-pulse">
  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
</div>
```

---

## Reglas del Sistema

| Regla | Detalle |
|-------|---------|
| No `alert()` | Todos los estados deben mostrarse como texto en el UI |
| No `window.confirm()` | Usar `DashboardOverlayShell` con modal de confirmación |
| Spinner = `Loader2 animate-spin` | Importar desde `lucide-react` |
| Spinner de pantalla = `border-b-2 border-indigo-600` | Para rutas de carga de App.tsx |
| Iconos > emojis | Usar `lucide-react` siempre |

---

## ❌ Anti-patrones

| Prohibido | Por qué |
|-----------|---------|
| `alert('Error: ...')` | Ver instrucción: mostrar texto en UI |
| `confirm('¿Estás seguro?')` | Ver instrucción: usar modal de confirmación |
| Spinner con `animate-bounce` | El estándar es `animate-spin` |
| Empty state sin icono | Debe haber guía visual |
| Error sin descripción | Siempre describir qué falló |

---

## Ver también

- [buttons.md](./buttons.md) — Loading en botones
- [forms.md](./forms.md) — Error en campos de formulario
- [cards.md](./cards.md) — Skeleton dentro de cards
- `src/App.tsx` — Spinner de pantalla completa
- `src/pages/Topic/components/TopicContent.tsx` — Empty states de topic
