# Forms — Guía de Patrones UI

> Última actualización: 2026-04-28 — Phase 6 of institution-admin-platform-improvements-apr-2026

---

## Input de Texto Estándar

```tsx
<div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
    Nombre del curso
  </label>
  <input
    type="text"
    value={value}
    onChange={e => setValue(e.target.value)}
    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
    placeholder="Ej: Matemáticas I"
  />
</div>
```

---

## Input en Fondo Ligeramente Gris (Secciones de config)

Cuando el formulario está en un fondo blanco (`bg-white`) y se desea un contraste sutil en el input.

```tsx
<input
  type="text"
  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
/>
```

---

## Input con Icono Prefix

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
  <input
    type="text"
    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
    placeholder="Buscar..."
  />
</div>
```

---

## Textarea

```tsx
<textarea
  rows={4}
  value={value}
  onChange={e => setValue(e.target.value)}
  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none minimal-scrollbar"
  placeholder="Descripción..."
/>
```

**Nota:** Usar `resize-none` para evitar que el usuario redimensione. Agregar `minimal-scrollbar` si la altura es fija.

---

## Select / Dropdown

```tsx
<select
  value={selected}
  onChange={e => setSelected(e.target.value)}
  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
>
  <option value="">Seleccionar...</option>
  {options.map(opt => (
    <option key={opt.value} value={opt.value}>{opt.label}</option>
  ))}
</select>
```

---

## Label

```tsx
// Obligatorio
<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
  Nombre
</label>

// Opcional (con indicador)
<label className="text-sm font-medium text-slate-700 dark:text-slate-300">
  Descripción
  <span className="ml-1 text-xs text-slate-400 font-normal">(opcional)</span>
</label>
```

---

## Mensaje de Error

```tsx
{error && (
  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
    {error}
  </p>
)}
```

---

## Mensaje de Ayuda (Helper Text)

```tsx
<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
  Máximo 80 caracteres.
</p>
```

---

## Sección de Formulario (Group)

Para agrupar campos relacionados en un formulario de overlay.

```tsx
<div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
    Información básica
  </h3>
  <div className="flex flex-col gap-4">
    {/* inputs */}
  </div>
</div>
```

---

## Footer de Formulario (Acciones)

```tsx
<div className="px-5 py-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-900">
  <button
    type="button"
    onClick={onClose}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
  >
    Cancelar
  </button>
  <button
    type="submit"
    disabled={isSubmitting}
    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60"
  >
    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
    {isSubmitting ? 'Guardando...' : 'Guardar'}
  </button>
</div>
```

---

## Reglas de Focus

- **Focus visible:** `focus:ring-2 focus:ring-indigo-500` — aplica a todos los inputs
- **Outline:** `outline-none` — siempre junto con `focus:ring-*`
- **Sin border-b-only focus:** Solo en editors especiales (como `QuizEdit.tsx`)

---

## ❌ Anti-patrones

| Prohibido | Por qué |
|-----------|---------|
| `focus:outline-none` sin `focus:ring` | Elimina accesibilidad de teclado |
| Labels en inglés | Todos los labels visibles deben estar en español |
| `alert()` para errores | Ver instrucción: usar texto inline |
| `resize: both` en textareas | Altera el layout del formulario |
| Validación solo en frontend | Siempre validar también en Firestore rules (backend) |

---

## Ver también

- [buttons.md](./buttons.md) — Botones de submit
- [states.md](./states.md) — Loading/error dentro de formularios
- `src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx`
- `src/pages/InstitutionAdminDashboard/components/UsersTabContent.tsx`
