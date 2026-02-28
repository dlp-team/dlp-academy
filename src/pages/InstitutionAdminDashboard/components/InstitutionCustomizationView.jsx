// src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.jsx
//
// Live-preview customization panel.
//
// How the real-app preview works
// ──────────────────────────────
// 1. We render an <iframe> pointing to /home (same origin).
// 2. Once loaded we inject a <style id="__dlp_preview_theme"> into the
//    iframe's document with CSS variable overrides on `.home-page`.
//    This makes the real Home page reflect every color change instantly —
//    no Firestore write required until the user clicks Save.
// 3. We guard against infinite loops: if the iframe navigates to an admin
//    page we push it back to /home.
// 4. The sidebar is collapsible so the preview can fill the whole width.

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Palette, Save, X, Upload, ChevronLeft, ChevronRight,
  Check, Eye, RefreshCw, Monitor, Tablet, Smartphone, RotateCcw,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

const hexToRgba = (hex, alpha) => {
  if (!hex) return null;
  const h = hex.trim();
  const full = h.length === 4
    ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
    : h;
  const n = parseInt(full.slice(1), 16);
  if (isNaN(n)) return null;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};

const buildCssBlock = (c) => `
  .home-page {
    --home-primary:            ${c.primary}                                          !important;
    --home-secondary:          ${c.secondary}                                        !important;
    --home-accent:             ${c.accent}                                           !important;
    --home-muted-text:         ${c.mutedText}                                        !important;
    --home-card-border:        ${c.cardBorder}                                       !important;
    --home-card-background:    ${c.cardBackground}                                   !important;
    --home-primary-soft:       ${hexToRgba(c.primary,    0.12) ?? 'rgba(99,102,241,0.12)'}  !important;
    --home-primary-soft-dark:  ${hexToRgba(c.primary,    0.24) ?? 'rgba(99,102,241,0.24)'}  !important;
    --home-secondary-soft:     ${hexToRgba(c.secondary,  0.12) ?? 'rgba(245,158,11,0.12)'}  !important;
    --home-secondary-soft-dark:${hexToRgba(c.secondary,  0.24) ?? 'rgba(245,158,11,0.24)'}  !important;
  }
`;

const injectTheme = (iframeEl, colors) => {
  try {
    const doc = iframeEl?.contentDocument;
    if (!doc?.head) return;
    let tag = doc.getElementById('__dlp_preview_theme');
    if (!tag) {
      tag = doc.createElement('style');
      tag.id = '__dlp_preview_theme';
      doc.head.appendChild(tag);
    }
    tag.textContent = buildCssBlock(colors);
  } catch { /* cross-origin or not yet loaded */ }
};

// ─── defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM = {
  institutionName: '',
  logoUrl: '',
  primary:         '#6366f1',
  secondary:       '#f59e0b',
  accent:          '#14b8a6',
  mutedText:       '#6b7280',
  cardBorder:      '#d1d5db',
  cardBackground:  '#ffffff',
};

const VIEWPORTS = [
  { id: 'desktop', icon: Monitor,    label: 'Escritorio', width: '100%'  },
  { id: 'tablet',  icon: Tablet,     label: 'Tablet',     width: '768px' },
  { id: 'mobile',  icon: Smartphone, label: 'Móvil',      width: '390px' },
];

// ─── sub-components ───────────────────────────────────────────────────────────

const ColorField = ({ label, id, value, onChange }) => (
  <div className="flex items-center gap-2.5">
    <label
      htmlFor={`cp-${id}`}
      className="text-xs font-medium text-slate-500 dark:text-slate-400 w-28 shrink-0 leading-snug"
    >
      {label}
    </label>
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {/* colour swatch – clicking it opens the native picker */}
      <div
        className="relative w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 shadow-sm cursor-pointer"
        onClick={() => document.getElementById(`cp-${id}`)?.click()}
      >
        <input
          type="color"
          id={`cp-${id}`}
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="w-full h-full pointer-events-none" style={{ backgroundColor: value }} />
      </div>
      {/* hex text input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
        placeholder="#000000"
        maxLength={7}
      />
    </div>
  </div>
);

const SidebarSection = ({ title, children }) => (
  <section>
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 px-0.5">
      {title}
    </p>
    <div className="space-y-2.5">{children}</div>
  </section>
);

// ─── main component ───────────────────────────────────────────────────────────

/**
 * InstitutionCustomizationView
 *
 * Props
 * ─────
 * initialValues  – Partial form state pre-populated from Firestore
 * onSave         – async (formState) => void
 * homeUrl        – iframe src (default: '/home')
 * className      – extra classes on root element
 */
const InstitutionCustomizationView = ({
  initialValues,
  onSave,
  homeUrl = '/home',
  className = '',
}) => {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...(initialValues || {}) });
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewport,    setViewport]    = useState('desktop');
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeKey,   setIframeKey]   = useState(0);

  const iframeRef = useRef(null);

  // Sync prop changes (e.g. Firestore loaded after mount)
  useEffect(() => {
    if (!initialValues) return;
    setForm(prev => ({ ...prev, ...initialValues }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  // Push theme whenever colors change and iframe is live
  useEffect(() => {
    if (iframeReady && iframeRef.current) {
      injectTheme(iframeRef.current, form);
    }
  }, [
    iframeReady,
    form.primary, form.secondary, form.accent,
    form.mutedText, form.cardBorder, form.cardBackground,
  ]);

  const handleChange = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }, []);

  const handleReset = () => {
    setForm({ ...DEFAULT_FORM, ...(initialValues || {}) });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const path = iframe.contentWindow?.location?.pathname ?? '';
      // Anti-loop guard: bounce back if we ended up in the admin dashboard
      if (/admin|dashboard|customiz/i.test(path)) {
        iframe.contentWindow.location.replace(homeUrl);
        return;
      }
    } catch { /* cross-origin – can't check, assume fine */ }
    setIframeReady(true);
    injectTheme(iframe, form);
  }, [form, homeUrl]);

  const reloadIframe = () => {
    setIframeReady(false);
    setIframeKey(k => k + 1);
  };

  const currentViewport = VIEWPORTS.find(v => v.id === viewport);

  // ── Save button shared style ──
  const saveBtnStyle = { backgroundColor: saved ? '#10b981' : saving ? '#818cf8' : form.primary };

  return (
    <div className={`flex h-full w-full overflow-hidden rounded-2xl ${className}`}>

      {/* ════════════════════════════════════
          SIDEBAR
      ════════════════════════════════════ */}
      <aside
        className={`
          relative flex flex-col h-full shrink-0
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700
          transition-[width] duration-300 ease-in-out
          ${sidebarOpen ? 'w-72' : 'w-14'}
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
            style={{ backgroundColor: form.primary }}
          >
            <Palette size={15} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                Personalización
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">Vista en tiempo real</p>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {sidebarOpen ? (
            <div className="px-4 py-4 space-y-5">
              {/* ── Identity ── */}
              <SidebarSection title="Identidad">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                    Nombre de la institución
                  </label>
                  <input
                    type="text"
                    value={form.institutionName}
                    onChange={e => handleChange('institutionName', e.target.value)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
                    placeholder="Mi Institución"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                    URL del logotipo
                  </label>
                  <div className="relative">
                    <Upload size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={form.logoUrl}
                      onChange={e => handleChange('logoUrl', e.target.value)}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl pl-7 pr-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition"
                      placeholder="https://…/logo.png"
                    />
                  </div>
                </div>
              </SidebarSection>

              {/* ── Brand colors ── */}
              <SidebarSection title="Colores principales">
                <ColorField label="Color primario"   id="primary"   value={form.primary}   onChange={handleChange} />
                <ColorField label="Color secundario" id="secondary" value={form.secondary} onChange={handleChange} />
                <ColorField label="Acento"           id="accent"    value={form.accent}    onChange={handleChange} />
              </SidebarSection>

              {/* ── Card & text ── */}
              <SidebarSection title="Tarjetas y texto">
                <ColorField label="Texto atenuado"   id="mutedText"       value={form.mutedText}       onChange={handleChange} />
                <ColorField label="Borde de tarjeta" id="cardBorder"      value={form.cardBorder}      onChange={handleChange} />
                <ColorField label="Fondo de tarjeta" id="cardBackground"  value={form.cardBackground}  onChange={handleChange} />
              </SidebarSection>

              {/* ── Palette swatches ── */}
              <SidebarSection title="Paleta actual">
                <div className="flex gap-1.5 flex-wrap">
                  {[form.primary, form.secondary, form.accent,
                    form.mutedText, form.cardBorder, form.cardBackground
                  ].map((color, i) => (
                    <div
                      key={i}
                      title={color}
                      className="w-8 h-8 rounded-xl border border-black/10 shadow-sm cursor-default"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </SidebarSection>
            </div>
          ) : (
            /* Collapsed: show colour swatches as vertical pills */
            <div className="flex flex-col items-center pt-3 gap-2 px-3">
              {[form.primary, form.secondary, form.accent].map((c, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-lg border border-black/10 shadow-sm"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className={`shrink-0 border-t border-slate-100 dark:border-slate-800 ${
            sidebarOpen ? 'px-4 py-3 space-y-2' : 'px-2 py-3 flex flex-col items-center gap-2'
          }`}
        >
          {sidebarOpen ? (
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 flex-1 text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw size={12} /> Restablecer
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 flex-1 text-xs font-semibold px-3 py-2 rounded-xl text-white transition disabled:opacity-70"
                style={saveBtnStyle}
              >
                {saving ? <RefreshCw size={12} className="animate-spin" /> : saved ? <Check size={12} /> : <Save size={12} />}
                {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar'}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                title="Guardar"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-white transition disabled:opacity-70"
                style={saveBtnStyle}
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
              </button>
              <button
                onClick={handleReset}
                title="Restablecer"
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw size={14} />
              </button>
            </>
          )}
        </div>

        {/* Collapse / expand toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="absolute -right-3.5 top-16 z-20 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          title={sidebarOpen ? 'Colapsar' : 'Expandir'}
        >
          {sidebarOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>
      </aside>

      {/* ════════════════════════════════════
          PREVIEW AREA
      ════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-200 dark:bg-slate-950">

        {/* ── Browser toolbar ── */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">
          {/* traffic lights */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-amber-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>

          {/* fake URL bar */}
          <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 min-w-0 mx-1">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: form.primary }} />
            <span className="text-xs font-mono text-slate-400 truncate">{homeUrl}</span>
          </div>

          {/* viewport buttons */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shrink-0">
            {VIEWPORTS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setViewport(id)}
                title={label}
                className={`p-1.5 rounded-md transition ${
                  viewport === id
                    ? 'text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                style={viewport === id ? { backgroundColor: form.primary } : {}}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>

          {/* reload */}
          <button
            onClick={reloadIframe}
            title="Recargar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition shrink-0"
          >
            <RefreshCw size={13} />
          </button>

          {/* status */}
          {!iframeReady
            ? <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0"><RefreshCw size={10} className="animate-spin" /> Cargando</span>
            : <span className="text-[11px] text-emerald-500 flex items-center gap-1 shrink-0"><Eye size={10} /> En vivo</span>
          }
        </div>

        {/* ── Iframe stage ── */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-4">
          <div
            className="relative bg-white shadow-2xl rounded-xl overflow-hidden transition-[width] duration-500"
            style={{
              width: currentViewport.width,
              minWidth: viewport === 'desktop' ? '100%' : undefined,
              height: '100%',
              minHeight: 600,
            }}
          >
            {/* Loading veil */}
            {!iframeReady && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-slate-950 gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: hexToRgba(form.primary, 0.12) ?? '#eef2ff' }}
                >
                  <RefreshCw size={22} className="animate-spin" style={{ color: form.primary }} />
                </div>
                <p className="text-sm text-slate-400">Cargando vista previa…</p>
                <p className="text-xs text-slate-300 max-w-xs text-center">
                  Si tarda demasiado, comprueba que la ruta <code className="font-mono">{homeUrl}</code> es accesible.
                </p>
              </div>
            )}

            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={homeUrl}
              onLoad={handleIframeLoad}
              className="w-full h-full border-0"
              style={{ minHeight: 600 }}
              title="Vista previa en vivo"
            />
          </div>
        </div>

        {/* ── Bottom hint ── */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 shrink-0">
          <p className="text-[11px] text-slate-400 leading-tight">
            Los cambios de color se aplican al instante en la vista previa. Pulsa <strong>Guardar</strong> para que todos los usuarios vean la nueva apariencia.
          </p>
          {!sidebarOpen && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition disabled:opacity-70"
              style={saveBtnStyle}
            >
              {saving ? <RefreshCw size={11} className="animate-spin" /> : saved ? <Check size={11} /> : <Save size={11} />}
              {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar cambios'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutionCustomizationView;