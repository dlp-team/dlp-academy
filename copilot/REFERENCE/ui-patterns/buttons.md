# Buttons — Guía de Patrones UI

> Última actualización: 2026-04-28 — Phase 6 of institution-admin-platform-improvements-apr-2026

---

## Variantes Principales

### Primario (Acción principal)

```tsx
<button
  type="button"
  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
>
  <Icon className="w-4 h-4" />
  Guardar
</button>
```

**Cuándo usar:** Acción principal de un formulario o sección (Guardar, Crear, Confirmar).

---

### Secundario (Acción alternativa)

```tsx
<button
  type="button"
  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
>
  Cancelar
</button>
```

**Cuándo usar:** Cancelar, volver, acciones alternativas no destructivas.

---

### Peligro / Destructivo

```tsx
<button
  type="button"
  className="px-3 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
>
  Eliminar
</button>
```

**Cuándo usar:** Eliminar, vaciar, acciones irreversibles.

---

### Ghost / Subtle

```tsx
<button
  type="button"
  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
>
  <Icon className="w-4 h-4" />
  Opción
</button>
```

**Cuándo usar:** Acciones secundarias de baja prominencia, en toolbars o listas.

---

### Icono Solo (Icon Button)

```tsx
<button
  type="button"
  aria-label="Cerrar"
  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
>
  <X className="w-4 h-4" />
</button>
```

**Cuándo usar:** Botones de icono puro (cerrar, editar inline, menú).  
**Regla:** Siempre incluir `aria-label`.

---

### Paginación / Navegación

```tsx
<button
  type="button"
  disabled={!hasPrev}
  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
>
  <ChevronLeft className="w-4 h-4" />
  Anterior
</button>
```

---

### Con Loading Spinner

```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60"
>
  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
  {isSubmitting ? 'Guardando...' : 'Guardar'}
</button>
```

---

## Tamaños

| Tamaño | `px` | `py` | `text` | Uso |
|--------|------|------|--------|-----|
| XS | `px-2.5` | `py-1` | `text-xs` | Badges de acción, notificaciones |
| SM | `px-3` | `py-1.5` | `text-sm` | Modales, sidebars |
| MD | `px-4` | `py-2` | `text-sm` | Acciones principales |
| LG | `px-6` | `py-2.5` | `text-base` | CTA en páginas |

---

## Bordes Redondeados Estándar

| Variante | Clase | Uso |
|----------|-------|-----|
| Pill / Full | `rounded-full` | FAB, CTAs de hero |
| Redondeado grande | `rounded-xl` | Botones de tabs |
| Redondeado estándar | `rounded-lg` | Botones de formularios y modales |
| Redondeado pequeño | `rounded-md` | Botones inline compactos |

---

## Reglas de Color

| Función | Color | Hover |
|---------|-------|-------|
| Acción primaria | `bg-indigo-600` | `hover:bg-indigo-700` |
| Acción de éxito | `bg-emerald-600` | `hover:bg-emerald-700` |
| Acción destructiva | `bg-red-600` | `hover:bg-red-700` |
| Acción de alerta | `bg-amber-500` | `hover:bg-amber-600` |
| Acción neutra | borde + slate | `hover:bg-slate-100 dark:hover:bg-slate-800` |

---

## ❌ Anti-patrones

| Prohibido | Por qué |
|-----------|---------|
| Botones con `alert()` | Ver instrucción: usar texto en lugar de alertas |
| Emojis en texto de botón | Ver instrucción: usar iconos Lucide React |
| Texto en inglés visible | Todos los labels deben ser en español |
| `cursor-pointer` sin `disabled:cursor-not-allowed` | El estado deshabilitado debe ser explícito |
| `button` sin `type="button"` en formularios | Puede disparar submit accidentalmente |

---

## Ver también

- [forms.md](./forms.md) — Botones de submit en formularios
- [states.md](./states.md) — Spinners de carga en botones
- `src/components/modals/shared/ModalGradientSubmitButton.tsx`
- `src/components/ui/TablePagination.tsx`
