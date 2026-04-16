# Scrollbars — Guía de Patrones UI

> Última actualización: 2026-04-28 — Phase 6 of institution-admin-platform-improvements-apr-2026

---

## Resumen de Clases Disponibles

| Clase CSS | Uso correcto | Descripción |
|-----------|-------------|-------------|
| `minimal-scrollbar` | Paneles internos con scroll | Scrollbar delgado (8px), temático claro/oscuro |
| `clean-scrollbar` | Root de overlay/modal | Scrollbar oculto (`scrollbar-width: none`) |
| `app-global-scrollbar` + `os-theme-dlp` | Scroll de página completa | OverlayScrollbars personalizado |

---

## Regla Principal

> **`minimal-scrollbar`** → paneles internos con overflow  
> **`clean-scrollbar`** → contenedor raíz de overlays/modales  
> **`app-global-scrollbar`** → solo en el scroll de nivel de página

---

## `minimal-scrollbar`

Definida en `src/index.css` (línea 262).

**Cuándo usar:** Cualquier panel, lista, sidebar o área con contenido que puede hacer scroll dentro de un componente (no el modal raíz).

```tsx
// Panel lateral con scroll
<aside className="h-full overflow-y-auto minimal-scrollbar">
  {items}
</aside>

// Lista de resultados
<ul className="max-h-64 overflow-y-auto minimal-scrollbar">
  {results}
</ul>
```

**Características:**
- Ancho de scrollbar: `8px`
- Track: transparente
- Thumb: `bg-slate-300` (light) / `bg-slate-600` (dark)
- Hover/active: `bg-slate-400` (light) / `bg-slate-500` (dark)
- Sin botones de scrollbar

---

## `clean-scrollbar`

Definida en `src/index.css` (línea 211).

**Cuándo usar:** El elemento root del overlay/modal donde el scroll debe estar oculto pero funcional. También para cualquier contenedor donde el scrollbar visual es indeseable.

```tsx
// Root de overlay manual
<div
  className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto clean-scrollbar"
  style={OVERLAY_TOP_OFFSET_STYLE}
>

// Overlay automático (DashboardOverlayShell lo aplica internamente)
// No necesita especificarse; DashboardOverlayShell ya lo incluye en rootClassName
```

**Características:**
- `scrollbar-width: none` (Firefox)
- `::-webkit-scrollbar { display: none }` (Chrome/Safari)

---

## `app-global-scrollbar` + `os-theme-dlp`

Definida en `src/index.css` (línea 236).

**Cuándo usar:** Solo para el scrollbar de la página principal gestionado por OverlayScrollbars. No usar en componentes internos.

**Lógica especial:** Cuando `body.has-fixed-header` está activo (gestionado por `Header.tsx`), el scrollbar vertical se desplaza `5rem` hacia abajo para no quedar bajo el header.

```tsx
// Configurado internamente en src/main.tsx o en el root de la app
// NO usar manualmente en componentes de feature
```

---

## Combinación Correcta en Overlays

```tsx
// ✅ Patrón correcto
<div
  className="fixed inset-x-0 bottom-0 z-50 overflow-y-auto clean-scrollbar"  // root: sin scrollbar visible
  style={OVERLAY_TOP_OFFSET_STYLE}
>
  <div className="...panel-content...">
    <aside className="overflow-y-auto minimal-scrollbar">  // panel interno: scrollbar delgado
      {children}
    </aside>
  </div>
</div>
```

---

## ❌ Anti-patrones

| Prohibido | Por qué |
|-----------|---------|
| `minimal-scrollbar` en root de overlay | Muestra scrollbar donde no debe verse |
| `clean-scrollbar` en paneles internos | Oculta el scroll del usuario en contenido navegable |
| `app-global-scrollbar` en componentes | Solo para el root de la app |
| `overflow-y: scroll` sin clase de scrollbar | Aplica el scrollbar por defecto del navegador (inconsistente) |
| Scrollbars con ancho > 8px en paneles internos | Rompe la consistencia visual |

---

## Ver también

- [overlays.md](./overlays.md) — Cómo posicionar overlays correctamente
- `src/index.css` líneas 211–310
