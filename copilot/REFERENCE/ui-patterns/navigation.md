# Navigation — Guía de Patrones UI

> Última actualización: 2026-04-28 — Phase 6 of institution-admin-platform-improvements-apr-2026

---

## Tabs — Estilo Pill (Botones separados)

Usado en `TopicTabs.tsx` para navegación por secciones de un topic.

```tsx
<div className="flex items-center gap-2 overflow-x-auto minimal-scrollbar pb-1">
  {tabs.map(tab => (
    <button
      key={tab}
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${
        activeTab === tab
          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-lg'
          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {tab}
    </button>
  ))}
</div>
```

**Activo:** `bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900`  
**Inactivo:** `bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200`

---

## Tabs — Estilo Underline (Borde inferior)

Usado en `SubjectFormModal.tsx` y `FolderManager.tsx` para tabs dentro de modales.

```tsx
<div className="flex border-b border-slate-200 dark:border-slate-700">
  {tabs.map(tab => (
    <button
      key={tab.key}
      type="button"
      onClick={() => setActive(tab.key)}
      className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
        active === tab.key
          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

**Activo:** `text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600`  
**Inactivo:** `text-slate-500 dark:text-slate-400`

---

## Tab Content Panel

El panel de contenido asociado a los tabs.

```tsx
<div className="flex-1 overflow-y-auto minimal-scrollbar">
  {activeTab === 'contenido' && <ContentTab />}
  {activeTab === 'recursos' && <ResourcesTab />}
</div>
```

---

## Sidebar Navigation

Para navegación lateral de la app (`src/components/layout/Sidebar.jsx`).

```tsx
// Item activo
<a className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
  <Icon className="w-5 h-5" />
  Inicio
</a>

// Item inactivo
<a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">
  <Icon className="w-5 h-5" />
  Materias
</a>
```

---

## Breadcrumbs

Para navegación jerárquica dentro de la app (Subject → Folder → Topic).

```tsx
<nav aria-label="Ruta de navegación" className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
  <span 
    onClick={goToSubject}
    className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
  >
    Matemáticas
  </span>
  <ChevronRight className="w-3 h-3 flex-shrink-0" />
  <span
    onClick={goToFolder}
    className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
  >
    Unidad 1
  </span>
  <ChevronRight className="w-3 h-3 flex-shrink-0" />
  <span className="text-slate-700 dark:text-slate-200 font-medium">
    Tema actual
  </span>
</nav>
```

---

## Section Headers (Encabezados de sección)

Para headers internos de secciones dentro de overlays o páginas.

```tsx
// Header con acción
<div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
  <div>
    <h2 className="text-base font-semibold text-slate-900 dark:text-white">
      Usuarios
    </h2>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      Gestiona los usuarios de la institución.
    </p>
  </div>
  <button className="...">{/* Acción */}</button>
</div>

// Header simple
<h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
  Información general
</h3>
```

---

## Reglas de Tabs

| Situación | Variante a usar |
|-----------|----------------|
| Navegación entre secciones de una página | Pill |
| Navegación dentro de un modal/overlay | Underline |
| Tabs con iconos | Pill |
| Muchos tabs (scroll horizontal) | Pill + `overflow-x-auto minimal-scrollbar` |

---

## ❌ Anti-patrones

| Prohibido | Por qué |
|-----------|---------|
| Texto en inglés en tabs/breadcrumbs | Todo debe estar en español |
| Tabs sin indicador visual de activo | El usuario no sabe dónde está |
| `<a href>` para tabs SPA | Usar `<button>` con estado local |
| Sidebar sin `aria-current` en el ítem activo | Accesibilidad degradada |

---

## Ver también

- [buttons.md](./buttons.md) — Botones similares a tabs en otros contextos
- `src/pages/Topic/components/TopicTabs.tsx` — Implementación de tabs Pill
- `src/pages/Subject/modals/SubjectFormModal.tsx` — Tabs Underline
- `src/components/layout/Sidebar.jsx` — Navegación lateral
