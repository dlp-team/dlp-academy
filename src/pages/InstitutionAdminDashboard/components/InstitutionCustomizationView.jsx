// src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationView.jsx
//
// ─── What's new ───────────────────────────────────────────────────────────────
//  • Real-time iframe theme injection — color changes appear in <16 ms.
//  • Highlight mode — when a color field is being edited, affected elements
//    in the preview pulse with a coloured outline so the admin sees exactly
//    what changes.
//  • Big, obvious Refresh button centre-stage in the preview chrome.
//  • Full-screen mode — a single button stretches the whole panel to
//    cover the viewport (fixed overlay), sidebar still collapsible.
//  • Sidebar remembers collapse state via localStorage.

import React, {
  useState, useCallback, useRef, useEffect,
} from 'react';
import {
  Palette, Save, Upload, ChevronLeft, ChevronRight,
  Check, RefreshCw,
  RotateCcw, Maximize2, Minimize2, Zap, Info,
} from 'lucide-react';

import ColorField from './customization/ColorField';
import {
  COLOR_TOKENS,
  DEFAULTS,
  VIEWPORTS,
  hexToRgba,
  injectHighlight,
  injectTheme,
} from './customization/themePreviewUtils';

// ─── Main component ───────────────────────────────────────────────────────────

const InstitutionCustomizationView = ({
  initialValues,
  onSave,
  homeUrl = '/home',
  className = '',
}) => {
  const [form, setForm]           = useState({ ...DEFAULTS, ...(initialValues || {}) });
  const [saved,    setSaved]      = useState(false);
  const [saving,   setSaving]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return localStorage.getItem('dlp_cust_sidebar') !== 'closed'; } catch { return true; }
  });
  const [viewport,    setViewport]    = useState('desktop');
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeKey,   setIframeKey]   = useState(0);
  const [fullscreen,  setFullscreen]  = useState(false);
  // Which token is currently being edited (for highlight mode)
  const [activeToken, setActiveToken] = useState(null);

  const iframeRef = useRef(null);
  const lastValidPreviewRef = useRef({ ...DEFAULTS, ...(initialValues || {}) });

  const COLOR_FIELDS = ['primary', 'secondary', 'accent', 'cardBorder'];

  const isValidHexColor = useCallback((value) => {
    if (typeof value !== 'string') return false;
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
  }, []);

  const getPreviewSafeForm = useCallback((candidate, fallback) => {
    const source = candidate || {};
    const safeFallback = fallback || DEFAULTS;
    const safe = { ...source };

    COLOR_FIELDS.forEach((field) => {
      const nextValue = source[field];
      safe[field] = isValidHexColor(nextValue)
        ? nextValue
        : (safeFallback[field] || DEFAULTS[field]);
    });

    return safe;
  }, [isValidHexColor]);

  // ── Sync initialValues (Firestore arrives async) ──
  useEffect(() => {
    if (!initialValues) return;
    setForm(prev => ({ ...prev, ...initialValues }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  // ── Re-inject theme when iframe becomes ready ──
  useEffect(() => {
    if (iframeReady && iframeRef.current) {
      const safeForm = getPreviewSafeForm(form, lastValidPreviewRef.current);
      lastValidPreviewRef.current = safeForm;
      injectTheme(iframeRef.current, safeForm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeReady]);

  // ── Keep preview fully live on every change (fail-safe) ──
  useEffect(() => {
    if (!iframeReady || !iframeRef.current) return;
    const safeForm = getPreviewSafeForm(form, lastValidPreviewRef.current);
    lastValidPreviewRef.current = safeForm;
    injectTheme(iframeRef.current, safeForm);
    if (activeToken) {
      injectHighlight(iframeRef.current, activeToken, safeForm[activeToken]);
    }
  }, [form, iframeReady, activeToken, getPreviewSafeForm]);

  // ── Persist sidebar preference ──
  useEffect(() => {
    try { localStorage.setItem('dlp_cust_sidebar', sidebarOpen ? 'open' : 'closed'); } catch { }
  }, [sidebarOpen]);

  // ── Escape key exits fullscreen ──
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && fullscreen) setFullscreen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [fullscreen]);

  // ── Handle colour change: inject theme + highlight instantly ──
  const handleChange = useCallback((field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      const safeNext = getPreviewSafeForm(next, lastValidPreviewRef.current);
      lastValidPreviewRef.current = safeNext;
      if (iframeRef.current) {
        injectTheme(iframeRef.current, safeNext);
        if (activeToken === field) injectHighlight(iframeRef.current, field, safeNext[field]);
      }
      return next;
    });
    setSaved(false);
  }, [activeToken, getPreviewSafeForm]);

  const handleFocus = useCallback((token) => {
    setActiveToken(token);
    const safeForm = getPreviewSafeForm(form, lastValidPreviewRef.current);
    lastValidPreviewRef.current = safeForm;
    if (iframeRef.current) {
      injectHighlight(iframeRef.current, token, safeForm[token]);
    }
  }, [form, getPreviewSafeForm]);

  const handleBlur = useCallback(() => {
    // Keep token highlight persistent while editing so the affected preview
    // rectangles remain visible during continuous color changes.
  }, []);

  const handleReset = () => {
    const next = { ...DEFAULTS, ...(initialValues || {}) };
    setForm(next);
    setSaved(false);
    lastValidPreviewRef.current = getPreviewSafeForm(next, DEFAULTS);
    if (iframeRef.current) {
      injectTheme(iframeRef.current, lastValidPreviewRef.current);
      injectHighlight(iframeRef.current, null, null);
    }
    setActiveToken(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const path = iframe.contentWindow?.location?.pathname ?? '';
      if (/admin|dashboard|customiz/i.test(path)) {
        iframe.contentWindow.location.replace(homeUrl);
        return;
      }
    } catch { /* cross-origin */ }
    setIframeReady(true);
    const safeForm = getPreviewSafeForm(form, lastValidPreviewRef.current);
    lastValidPreviewRef.current = safeForm;
    injectTheme(iframe, safeForm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeUrl, form, getPreviewSafeForm]);

  const reloadIframe = () => {
    setIframeReady(false);
    setActiveToken(null);
    setIframeKey(k => k + 1);
  };

  const saveBtnStyle = { backgroundColor: saved ? '#10b981' : saving ? '#818cf8' : form.primary };
  const currentVP = VIEWPORTS.find(v => v.id === viewport);

  // ── Root wrapper classes ─────────────────────────────────────────────────
  const rootCls = fullscreen
    ? 'fixed inset-0 z-[9999] flex'
    : `flex h-full w-full overflow-hidden rounded-2xl ${className}`;

  return (
    <div className={rootCls} style={{ background: '#e2e8f0' }}>

      {/* ══════════════════════════════════════
           SIDEBAR
      ══════════════════════════════════════ */}
      <aside
        className={`
          relative flex flex-col h-full shrink-0 z-10
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-700
          transition-[width] duration-300 ease-in-out
          shadow-xl
          ${sidebarOpen ? 'w-80' : 'w-14'}
        `}
      >
        {/* ─ Header ─ */}
        <div
          className={`flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 shrink-0 ${
            sidebarOpen ? '' : 'justify-center'
          }`}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-colors duration-300"
            style={{ backgroundColor: form.primary }}
          >
            <Palette size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Personalización</p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Vista en tiempo real
              </p>
            </div>
          )}
        </div>

        {/* ─ Scrollable controls ─ */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {sidebarOpen ? (
            <div className="px-4 py-4 space-y-4">

              {/* Identity */}
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
                  Identidad
                </p>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1.5">
                      Nombre de la institución
                    </label>
                    <input
                      type="text"
                      value={form.institutionName}
                      onChange={e => handleChange('institutionName', e.target.value)}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 transition"
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
                        className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl pl-7 pr-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 transition"
                        placeholder="https://…/logo.png"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Colour tokens */}
              <section>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Colores de marca
                  </p>
                  <span
                    className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: hexToRgba(form.primary, 0.10), color: form.primary }}
                  >
                    <Zap size={9} /> En vivo
                  </span>
                </div>

                {/* Hint */}
                <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 mb-3 border border-slate-100 dark:border-slate-700">
                  <Info size={12} className="shrink-0 mt-0.5 text-slate-400" />
                  <span>Haz clic en una ficha para ver qué elementos cambian en la vista previa.</span>
                </div>

                <div className="space-y-2">
                  {COLOR_TOKENS.map(t => (
                    <ColorField
                      key={t.id}
                      token={t.id}
                      label={t.label}
                      description={t.description}
                      icon={t.icon}
                      value={form[t.id] ?? '#6366f1'}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      isActive={activeToken === t.id}
                    />
                  ))}
                </div>
              </section>

              {/* Fixed tokens info */}
              <section className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Fijos (no personalizables)
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-4 h-4 rounded bg-slate-400/40 shrink-0" />
                    <span>Texto atenuado — gris neutro</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-4 h-4 rounded bg-white border border-slate-200 shrink-0" />
                    <span>Fondo de tarjeta — claro/oscuro auto</span>
                  </div>
                </div>
              </section>

              {/* Palette swatches */}
              <section>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Paleta actual
                </p>
                <div className="flex gap-2">
                  {[form.primary, form.secondary, form.accent, form.cardBorder].map((c, i) => (
                    <div
                      key={i}
                      title={c}
                      className="flex-1 h-8 rounded-xl border border-black/10 shadow-sm"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            /* Collapsed icon rail */
            <div className="flex flex-col items-center pt-3 gap-2 px-2">
              {[form.primary, form.secondary, form.accent, form.cardBorder].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-xl border border-black/10 shadow-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
          )}
        </div>

        {/* ─ Footer ─ */}
        <div
          className={`shrink-0 border-t border-slate-100 dark:border-slate-800 ${
            sidebarOpen ? 'px-4 py-3' : 'px-2 py-3 flex flex-col items-center gap-2'
          }`}
        >
          {sidebarOpen ? (
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 flex-1 text-xs font-medium px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <RotateCcw size={12} /> Restablecer
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 flex-1 text-xs font-bold px-3 py-2.5 rounded-xl text-white transition disabled:opacity-70 shadow-lg"
                style={{ ...saveBtnStyle, boxShadow: `0 4px 14px ${hexToRgba(form.primary, 0.35)}` }}
              >
                {saving ? <RefreshCw size={12} className="animate-spin" />
                  : saved ? <Check size={12} />
                  : <Save size={12} />}
                {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar cambios'}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                title="Guardar"
                className="w-9 h-9 flex items-center justify-center rounded-xl text-white shadow-md transition disabled:opacity-70"
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

        {/* ─ Collapse toggle ─ */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="absolute -right-3.5 top-14 z-20 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          title={sidebarOpen ? 'Colapsar panel' : 'Expandir panel'}
        >
          {sidebarOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>
      </aside>

      {/* ══════════════════════════════════════
           PREVIEW AREA
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ─ Browser chrome toolbar ─ */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shrink-0">

          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 shrink-0 mr-1">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>

          {/* Fake URL bar */}
          <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: form.primary }} />
            <span className="text-xs font-mono text-slate-400 truncate">{homeUrl}</span>
          </div>

          {/* Viewport switcher */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shrink-0">
            {VIEWPORTS.map(({ id, Icon, label }) => (
              <button
                key={id}
                onClick={() => setViewport(id)}
                title={label}
                className={`p-1.5 rounded-md transition text-sm ${
                  viewport === id ? 'text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                style={viewport === id ? { backgroundColor: form.primary } : {}}
              >
                <Icon size={13} />
              </button>
            ))}
          </div>

          {/* ── BIG REFRESH BUTTON ── */}
          <button
            onClick={reloadIframe}
            title="Recargar vista previa"
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
              border-2 transition-all duration-200 shrink-0
              ${iframeReady
                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-current hover:scale-105 active:scale-95'
                : 'border-amber-300 bg-amber-50 text-amber-700 animate-pulse'
              }
            `}
            style={iframeReady ? { hover: { borderColor: form.primary } } : {}}
          >
            <RefreshCw size={14} className={!iframeReady ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">
              {iframeReady ? 'Recargar' : 'Cargando…'}
            </span>
          </button>

          {/* Live status badge */}
          {iframeReady && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
              En vivo
            </span>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={() => setFullscreen(f => !f)}
            title={fullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition shrink-0"
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>

        {/* ─ Active-token banner ─ */}
        {activeToken && (
          <div
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium border-b shrink-0 transition-all"
            style={{
              backgroundColor: hexToRgba(form[activeToken], 0.08),
              borderColor: hexToRgba(form[activeToken], 0.25),
              color: form[activeToken],
            }}
          >
            <span
              className="w-3 h-3 rounded-full border-2 border-white shadow-sm animate-pulse shrink-0"
              style={{ backgroundColor: form[activeToken] }}
            />
            <span>
              Editando <strong>{COLOR_TOKENS.find(t => t.id === activeToken)?.label}</strong>
              {' — '}los elementos destacados en la vista previa son los afectados por este color.
            </span>
          </div>
        )}

        {/* ─ Iframe stage ─ */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-slate-200 dark:bg-slate-950">
          <div
            className="relative shadow-2xl rounded-xl overflow-hidden transition-[width] duration-500 bg-white"
            style={{
              width: currentVP.width,
              minWidth: viewport === 'desktop' ? '100%' : undefined,
              height: '100%',
              minHeight: 600,
              // active-token coloured glow on the whole preview frame
              ...(activeToken ? {
                outline: `3px solid ${form[activeToken]}`,
                outlineOffset: '3px',
                boxShadow: `0 0 0 6px ${hexToRgba(form[activeToken], 0.12)}, 0 20px 60px rgba(0,0,0,0.18)`,
              } : {
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              }),
            }}
          >
            {/* Loading veil */}
            {!iframeReady && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-slate-950 gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ backgroundColor: hexToRgba(form.primary, 0.12) ?? '#eef2ff' }}
                >
                  <RefreshCw size={28} className="animate-spin" style={{ color: form.primary }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600">Cargando vista previa…</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Ruta: <code className="font-mono">{homeUrl}</code>
                  </p>
                </div>
                {/* Big manual reload during load */}
                <button
                  onClick={reloadIframe}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white mt-2 shadow-lg transition active:scale-95"
                  style={{ backgroundColor: form.primary }}
                >
                  <RefreshCw size={15} /> Reintentar
                </button>
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

        {/* ─ Bottom status bar ─ */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 shrink-0">
          <p className="text-[11px] text-slate-400 leading-tight">
            {saved
              ? '✅ Cambios guardados — todos los usuarios verán la nueva apariencia.'
              : 'Los cambios se aplican en tiempo real. Pulsa Guardar para que sean permanentes.'
            }
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {fullscreen && (
              <button
                onClick={() => setFullscreen(false)}
                className="text-[11px] flex items-center gap-1 text-slate-500 hover:text-slate-700 transition"
              >
                <Minimize2 size={11} /> Salir
              </button>
            )}
            {!sidebarOpen && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition disabled:opacity-70 shadow-md"
                style={saveBtnStyle}
              >
                {saving ? <RefreshCw size={11} className="animate-spin" /> : saved ? <Check size={11} /> : <Save size={11} />}
                {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionCustomizationView;