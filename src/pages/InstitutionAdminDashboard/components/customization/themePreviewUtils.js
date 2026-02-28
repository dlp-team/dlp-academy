import { Monitor, Smartphone, Tablet } from 'lucide-react';

const TOKEN_SELECTORS = {
  primary: [
    'button[class*="bg-indigo"], button[class*="bg-primary"], [class*="bg-indigo-6"], [class*="bg-indigo-5"]',
    '[class*="indigo"][class*="active"], [aria-selected="true"]',
    'a[class*="indigo"], [class*="text-indigo-6"]',
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

export const DEFAULTS = {
  institutionName: '',
  logoUrl: '',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#a855f7',
  cardBorder: '#d1d5db',
};

export const VIEWPORTS = [
  { id: 'desktop', Icon: Monitor, label: 'Escritorio', width: '100%' },
  { id: 'tablet', Icon: Tablet, label: 'Tablet', width: '768px' },
  { id: 'mobile', Icon: Smartphone, label: 'Móvil', width: '390px' },
];

export const COLOR_TOKENS = [
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

export const hexToRgba = (hex, alpha) => {
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
  const a = hexToRgb(baseHex);
  const b = hexToRgb(mixHex_);
  if (!a || !b) return baseHex;
  const mw = 1 - w;
  const ch = (v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${ch(a.r * w + b.r * mw)}${ch(a.g * w + b.g * mw)}${ch(a.b * w + b.b * mw)}`;
};

const scale = (hex) => ({
  50: mix(hex, '#ffffff', 0.10),
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

const buildThemeCss = (c) => {
  const p = scale(c.primary);
  const s = scale(c.secondary);
  const t = scale(c.accent);
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

export const injectTheme = (iframe, colors) => {
  try {
    const doc = iframe?.contentDocument;
    if (!doc?.head) return;
    let tag = doc.getElementById('__dlp_theme');
    if (!tag) {
      tag = doc.createElement('style');
      tag.id = '__dlp_theme';
      doc.head.appendChild(tag);
    }
    tag.textContent = buildThemeCss(colors);
  } catch {
    // cross-origin / not loaded
  }
};

export const injectHighlight = (iframe, token, color) => {
  try {
    const doc = iframe?.contentDocument;
    if (!doc?.head) return;
    let tag = doc.getElementById('__dlp_highlight');
    if (!tag) {
      tag = doc.createElement('style');
      tag.id = '__dlp_highlight';
      doc.head.appendChild(tag);
    }
    tag.textContent = token ? buildHighlightCss(token, color) : '';
  } catch {
    // cross-origin
  }
};
