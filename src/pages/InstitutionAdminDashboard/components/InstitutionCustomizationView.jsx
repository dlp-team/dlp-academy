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
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import {
  Palette, Save, Upload, ChevronLeft, ChevronRight,
  Check, Eye, RefreshCw, Monitor, Tablet, Smartphone,
  RotateCcw, Maximize2, Minimize2, Zap, Info,
} from 'lucide-react';

// ─── CSS selectors affected by each colour token ──────────────────────────────
// These are used to build the "highlight" pulsing overlays inside the iframe.
const TOKEN_SELECTORS = {
  primary: [
    // buttons
    'button[class*="bg-indigo"], button[class*="bg-primary"], [class*="bg-indigo-6"], [class*="bg-indigo-5"]',
    // active tabs / selected items
    '[class*="indigo"][class*="active"], [aria-selected="true"]',
    // links & ctas
    'a[class*="indigo"], [class*="text-indigo-6"]',
    // nav highlight
    '[class*="indigo-100"][class*="dark:bg-indigo"], [class*="bg-primary"]',
  ],
  secondary: [
    '[class*="bg-purple"], [class*="text-purple"]',
    '[class*="secondary"]',
  ],
  accent: [
    '[class*="bg-teal"], [class*="text-teal"], [class*="bg-emerald"]',
    '[class*="badge"], [class*="tag"], [class*="dot"], [class*="notification"]',
  ],
  cardBorder: [
    '[class*="border-gray-2"], [class*="border-slate-2"]',
    '[class*="rounded-2xl"][class*="border"], [class*="rounded-xl"][class*="border"]',
  ],
};

// ─── Colour helpers ────────────────────────────────────────────────────────────

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

const hexToRgb = (hex) => {
  if (!hex) return null;
  const h = hex.trim();
  const full = h.length === 4
    ? `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
    : h;
  const n = parseInt(full.slice(1), 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const mix = (baseHex, mixHex_, w) => {
  const a = hexToRgb(baseHex), b = hexToRgb(mixHex_);
  if (!a || !b) return baseHex;
  const mw = 1 - w;
  const ch = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${ch(a.r * w + b.r * mw)}${ch(a.g * w + b.g * mw)}${ch(a.b * w + b.b * mw)}`;
};

const scale = (hex) => ({
  50:  mix(hex, '#ffffff', 0.10),
  100: mix(hex, '#ffffff', 0.18),
  200: mix(hex, '#ffffff', 0.30),
  300: mix(hex, '#ffffff', 0.45),
  400: mix(hex, '#ffffff', 0.65),
  500: mix(hex, '#ffffff', 0.82),
  600: hex,
  700: mix(hex, '#000000', 0.85),
  800: mix(hex, '#000000', 0.70),
  900: mix(hex, '#000000', 0.55),
});

// ─── CSS injected into iframe ─────────────────────────────────────────────────

const buildThemeCss = (c) => {
  const p = scale(c.primary), s = scale(c.secondary), t = scale(c.accent);
  return `
:root {
  --color-primary:${c.primary};
  --color-primary-50:${p[50]};--color-primary-100:${p[100]};--color-primary-200:${p[200]};
  --color-primary-300:${p[300]};--color-primary-400:${p[400]};--color-primary-500:${p[500]};
  --color-primary-600:${p[600]};--color-primary-700:${p[700]};--color-primary-800:${p[800]};
  --color-primary-900:${p[900]};
  --color-secondary:${c.secondary};
  --color-secondary-50:${s[50]};--color-secondary-100:${s[100]};--color-secondary-200:${s[200]};
  --color-secondary-300:${s[300]};--color-secondary-400:${s[400]};--color-secondary-500:${s[500]};
  --color-secondary-600:${s[600]};--color-secondary-700:${s[700]};--color-secondary-800:${s[800]};
  --color-secondary-900:${s[900]};
  --color-tertiary:${c.accent};
  --color-tertiary-50:${t[50]};--color-tertiary-100:${t[100]};--color-tertiary-200:${t[200]};
  --color-tertiary-300:${t[300]};--color-tertiary-400:${t[400]};--color-tertiary-500:${t[500]};
  --color-tertiary-600:${t[600]};--color-tertiary-700:${t[700]};--color-tertiary-800:${t[800]};
  --color-tertiary-900:${t[900]};
}
.home-page {
  --home-primary:${c.primary};
  --home-secondary:${c.secondary};
  --home-accent:${c.accent};
  --home-muted-text:#6b7280;
  --home-card-border:${c.cardBorder};
  --home-primary-soft:${hexToRgba(c.primary, 0.12) ?? 'rgba(99,102,241,.12)'};
  --home-primary-soft-dark:${hexToRgba(c.primary, 0.24) ?? 'rgba(99,102,241,.24)'};
  --home-secondary-soft:${hexToRgba(c.secondary, 0.12) ?? 'rgba(245,158,11,.12)'};
  --home-secondary-soft-dark:${hexToRgba(c.secondary, 0.24) ?? 'rgba(245,158,11,.24)'};
}`;
};

// Pulse/highlight keyframes + per-token class injected when a field is active
const buildHighlightCss = (token, color) => {
  const selectors = TOKEN_SELECTORS[token];
  if (!selectors) return '';
  const glow = hexToRgba(color, 0.55) ?? 'rgba(99,102,241,.55)';
  const soft = hexToRgba(color, 0.18) ?? 'rgba(99,102,241,.18)';
  const joined = selectors.join(', ');
  return `
@keyframes __dlp_pulse {
  0%,100% { box-shadow: 0 0 0 2px ${glow}, 0 0 12px 4px ${soft}; }
  50%      { box-shadow: 0 0 0 3px ${glow}, 0 0 22px 8px ${soft}; }
}
${joined} {
  outline: 2.5px solid ${color} !important;
  outline-offset: 2px !important;
  animation: __dlp_pulse 1.4s ease-in-out infinite !important;
  border-radius: 8px !important;
  position: relative !important;
  z-index: 1 !important;
}`;
};

// ─── Iframe helpers ───────────────────────────────────────────────────────────

const injectTheme = (iframe, colors) => {
  try {
    const doc = iframe?.contentDocument;
    if (!doc?.head) return;
    let tag = doc.getElementById('__dlp_theme');
    if (!tag) { tag = doc.createElement('style'); tag.id = '__dlp_theme'; doc.head.appendChild(tag); }
    tag.textContent = buildThemeCss(colors);
  } catch { /* cross-origin / not loaded */ }
};

const injectHighlight = (iframe, token, color) => {
  try {
    const doc = iframe?.contentDocument;
    if (!doc?.head) return;
    let tag = doc.getElementById('__dlp_highlight');
    if (!tag) { tag = doc.createElement('style'); tag.id = '__dlp_highlight'; doc.head.appendChild(tag); }
    tag.textContent = token ? buildHighlightCss(token, color) : '';
  } catch { /* cross-origin */ }
};

// ─── defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS = {
  institutionName: '',
  logoUrl: '',
  primary:    '#6366f1',
  secondary:  '#8b5cf6',
  accent:     '#a855f7',
  cardBorder: '#d1d5db',
};

const VIEWPORTS = [
  { id: 'desktop', Icon: Monitor,    label: 'Escritorio', width: '100%'  },
  { id: 'tablet',  Icon: Tablet,     label: 'Tablet',     width: '768px' },
  { id: 'mobile',  Icon: Smartphone, label: 'Móvil',      width: '390px' },
];

// Token metadata for sidebar rendering
const COLOR_TOKENS = [
  {
    id: 'primary',
    label: 'Color Primario',
    description: 'Botones principales, pestañas activas, enlaces clave',
    icon: '🎨',
  },
  {
    id: 'secondary',
    label: 'Color Secundario',
    description: 'Botones secundarios, banners informativos',
    icon: '🖌️',
  },
  {
    id: 'accent',
    label: 'Acento / Terciario',
    description: 'Insignias, etiquetas, notificaciones, iconos destacados',
    icon: '✨',
  },
  {
    id: 'cardBorder',
    label: 'Borde de tarjetas',
    description: 'Bordes de cards y paneles',
    icon: '🃏',
  },
];

// ─── ColorField ───────────────────────────────────────────────────────────────

const ColorField = ({ token, label, description, icon, value, onChange, onFocus, onBlur, isActive }) => {
  const inputRef = useRef(null);

  return (
    <div
      className={`
        rounded-xl border transition-all duration-200 cursor-pointer
        ${isActive
          ? 'border-current shadow-lg scale-[1.01]'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }
        bg-white dark:bg-slate-800/60
      `}
      style={isActive ? { borderColor: value, boxShadow: `0 0 0 3px ${hexToRgba(value, 0.18)}` } : {}}
      onClick={() => inputRef.current?.click()}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Big swatch */}
        <div className="relative shrink-0">
          <div
            className="w-11 h-11 rounded-xl shadow-md border-2 border-white dark:border-slate-700 transition-all duration-200"
            style={{ backgroundColor: value }}
          />
          {isActive && (
            <div
              className="absolute -inset-1 rounded-2xl animate-ping opacity-40"
              style={{ backgroundColor: value }}
            />
          )}
          <input
            ref={inputRef}
            type="color"
            value={value}
            onChange={(e) => onChange(token, e.target.value)}
            onFocus={() => onFocus(token)}
            onBlur={onBlur}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs">{icon}</span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{label}</span>
            {isActive && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none"
                style={{ backgroundColor: value }}
              >
                activo
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight truncate">{description}</p>
        </div>

        {/* Hex input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(token, e.target.value)}
          onFocus={() => onFocus(token)}
          onBlur={onBlur}
          onClick={(e) => e.stopPropagation()}
          className="w-20 text-[11px] font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 transition shrink-0"
          style={{ focusRingColor: value }}
          placeholder="#000000"
          maxLength={7}
        />
      </div>
    </div>
  );
};

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
  const highlightTimerRef = useRef(null);

  const iframeRef = useRef(null);

  // ── Sync initialValues (Firestore arrives async) ──
  useEffect(() => {
    if (!initialValues) return;
    setForm(prev => ({ ...prev, ...initialValues }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  // ── Re-inject theme when iframe becomes ready ──
  useEffect(() => {
    if (iframeReady && iframeRef.current) {
      injectTheme(iframeRef.current, form);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeReady]);

  // ── Keep preview fully live on every change (fail-safe) ──
  useEffect(() => {
    if (!iframeReady || !iframeRef.current) return;
    injectTheme(iframeRef.current, form);
    if (activeToken) {
      injectHighlight(iframeRef.current, activeToken, form[activeToken]);
    }
  }, [form, iframeReady, activeToken]);

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
      if (iframeRef.current) {
        injectTheme(iframeRef.current, next);
        if (activeToken === field) injectHighlight(iframeRef.current, field, value);
      }
      return next;
    });
    setSaved(false);
  }, [activeToken]);

  const handleFocus = useCallback((token) => {
    setActiveToken(token);
    clearTimeout(highlightTimerRef.current);
    if (iframeRef.current) {
      injectHighlight(iframeRef.current, token, form[token]);
    }
  }, [form]);

  const handleBlur = useCallback(() => {
    // Keep highlight for 1.5 s after blur so admin can see what changed
    highlightTimerRef.current = setTimeout(() => {
      setActiveToken(null);
      if (iframeRef.current) injectHighlight(iframeRef.current, null, null);
    }, 1500);
  }, []);

  const handleReset = () => {
    const next = { ...DEFAULTS, ...(initialValues || {}) };
    setForm(next);
    setSaved(false);
    if (iframeRef.current) {
      injectTheme(iframeRef.current, next);
      injectHighlight(iframeRef.current, null, null);
    }
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
    injectTheme(iframe, form);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeUrl]);

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