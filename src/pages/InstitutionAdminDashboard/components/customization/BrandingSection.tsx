// src/pages/InstitutionAdminDashboard/components/customization/BrandingSection.jsx
//
// Renders the Icon + Logo upload panels with a recommended color palette
// extracted from the uploaded image (client-side, no API call needed).
// Palette suggestions appear below each image and can be applied to the
// live preview without immediately persisting to Firestore.

import React, { useCallback, useRef, useState } from 'react';
import {
  CheckCircle2,
  ImagePlus,
  Link2,
  Loader2,
  Palette,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';

// ─── Color extraction helpers ───────────────────────────────────────────────

/**
 * Downsamples an image onto a small canvas and returns an array of the most
 * dominant hex colours, deduped by similarity.
 */
const extractPaletteFromImage = (src: string, count = 6): Promise<string[]> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const SIZE = 64;
      const canvas = document.createElement('canvas');
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve([]);
        return;
      }
      ctx.drawImage(img, 0, 0, SIZE, SIZE);
      const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

      // Build a frequency map of quantised colours
      const freq: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a < 128) continue; // skip transparent
        // Skip near-white and near-black
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (lum > 240 || lum < 15) continue;
        // Quantise to reduce noise
        const qr = Math.round(r / 16) * 16;
        const qg = Math.round(g / 16) * 16;
        const qb = Math.round(b / 16) * 16;
        const key = `${qr},${qg},${qb}`;
        freq[key] = (freq[key] || 0) + 1;
      }

      const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .map(([key]) => {
          const [r, g, b] = key.split(',').map(Number);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        });

      // Dedupe by distance
      const palette: string[] = [];
      for (const hex of sorted) {
        if (palette.length >= count) break;
        const isTooClose = palette.some(existing => colorDistance(hex, existing) < 60);
        if (!isTooClose) palette.push(hex);
      }

      resolve(palette);
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const colorDistance = (a: string, b: string) => {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  return Math.sqrt((ra.r - rb.r) ** 2 + (ra.g - rb.g) ** 2 + (ra.b - rb.b) ** 2);
};

const isFirebaseStorageUrl = (value: any) => {
  if (typeof value !== 'string') return false;
  return value.includes('firebasestorage.googleapis.com') || value.includes('storage.googleapis.com');
};

// ─── Palette Suggestion Strip ────────────────────────────────────────────────

const PaletteStrip = ({ colors, onApply, isLoading }: any) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Analizando colores…</span>
      </div>
    );
  }

  if (!colors?.length) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Paleta sugerida — clic para previsualizar
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((hex, i: any) => (
          <button
            key={hex}
            onClick={() => onApply(hex, i)}
            title={`Aplicar ${hex} a la paleta de marca`}
            className="group relative flex flex-col items-center gap-1"
          >
            <div
              className="w-8 h-8 rounded-xl border-2 border-white dark:border-slate-700 shadow-md ring-1 ring-black/10 transition-all group-hover:scale-110 group-hover:shadow-lg group-active:scale-95"
              style={{ backgroundColor: hex }}
            />
            <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
              {hex}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
        Los colores sugeridos solo se aplican a la vista previa. Guarda los cambios para persistirlos.
      </p>
    </div>
  );
};

// ─── Image Card (reused for icon + logo) ─────────────────────────────────────

const ImageCard = ({
  type,         // 'icon' | 'logo'
  title,
  subtitle,
  url,
  isUploading,
  uploadError,
  institutionLabel,
  onFileUpload,
  onUrlSave,
  onPaletteApply,
}: any) => {
  const [palette, setPalette] = useState<string[]>([]);
  const [paletteLoading, setPaletteLoading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState(() => {
    return isFirebaseStorageUrl(url) ? '' : (url || '');
  });
  const urlRef = useRef<any>(null);

  const isIcon = type === 'icon';

  const analyzeImage = useCallback(async (src: string) => {
    if (!src) return;
    setPaletteLoading(true);
    const colors = await extractPaletteFromImage(src, 6);
    setPalette(colors);
    setPaletteLoading(false);
  }, []);

  // Re-analyze whenever URL changes
  React.useEffect(() => {
    if (url) {
      const isStorageUrl = isFirebaseStorageUrl(url);
      setUrlDraft(isStorageUrl ? '' : url);
      if (isStorageUrl) {
        setPalette([]);
      } else {
        analyzeImage(url);
      }
    } else {
      setPalette([]);
    }
  }, [url, analyzeImage]);

  const handleApplySwatch = (hex: string, index: number) => {
    // Map swatch index to color token roles
    const TOKEN_ORDER = ['primary', 'secondary', 'accent', 'cardBorder'];
    const token = TOKEN_ORDER[index % TOKEN_ORDER.length];
    onPaletteApply?.({ token, color: hex });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Status badge */}
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
            url
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
          }`}
        >
          {url ? <CheckCircle2 className="w-3 h-3" /> : null}
          {url ? 'Configurado' : 'Sin configurar'}
        </span>
      </div>

      {/* Preview + controls */}
      <div className="p-5">
        <div className="flex items-start gap-5">
          {/* Preview box */}
          <div
            className={`
              shrink-0 flex items-center justify-center rounded-2xl overflow-hidden
              border-2 border-dashed border-slate-200 dark:border-slate-700
              bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-850
              transition-all duration-300
              ${isIcon ? 'w-20 h-20' : 'w-32 h-20'}
              ${url ? 'border-solid border-slate-200 dark:border-slate-700' : ''}
            `}
          >
            {url ? (
              <img
                src={url}
                alt={`Vista previa — ${title}`}
                className={`object-contain ${isIcon ? 'w-12 h-12' : 'max-w-full max-h-full p-2'}`}
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ImagePlus className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-1 flex flex-col gap-2.5">
            {/* Upload button */}
            <label className={`
              inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium
              cursor-pointer transition-all shadow-sm hover:shadow-md active:scale-[0.98]
              ${isIcon
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
              }
            `}>
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo…</>
              ) : (
                <><Upload className="w-4 h-4" /> Subir {isIcon ? 'icono' : 'logotipo'}</>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/x-icon,image/webp"
                className="hidden"
                onChange={onFileUpload}
                disabled={isUploading}
              />
            </label>

            {/* URL input toggle */}
            <button
              onClick={() => setShowUrlInput(v => !v)}
              className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
            >
              <Link2 className="w-3.5 h-3.5" />
              {showUrlInput ? 'Ocultar URL' : 'Usar URL externa'}
            </button>

            {showUrlInput && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  ref={urlRef}
                  type="text"
                  value={urlDraft}
                  onChange={e => setUrlDraft(e.target.value)}
                  placeholder="https://…/imagen.png"
                  className="flex-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 transition"
                />
                <button
                  onClick={() => onUrlSave?.(urlDraft)}
                  className="shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Guardar
                </button>
                {url && (
                  <button
                    onClick={() => { setUrlDraft(''); onUrlSave?.(''); }}
                    className="shrink-0 p-2 text-slate-400 hover:text-red-500 transition"
                    title="Eliminar imagen"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <X className="w-3 h-3" /> {uploadError}
              </p>
            )}
          </div>
        </div>

        {/* Context text */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 leading-relaxed">
          {isIcon
            ? `Aparece en la pestaña del navegador. Formatos recomendados: PNG o ICO de 32×32 px.`
            : `Se muestra en el encabezado de la aplicación de ${institutionLabel || 'la institución'}. PNG o SVG con fondo transparente.`
          }
        </p>

        {/* ─── Recommended palette ─── */}
        <PaletteStrip
          colors={palette}
          isLoading={paletteLoading}
          onApply={handleApplySwatch}
        />
      </div>
    </div>
  );
};

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * BrandingSection
 *
 * Props:
 *  - customizationForm   : { iconUrl, logoUrl, … }
 *  - institutionName     : string
 *  - iconUploading       : boolean
 *  - iconUploadError     : string
 *  - onIconUpload        : (event) => void
 *  - onIconUrlSave       : (url: string) => void
 *  - onLogoUpload        : (event) => void
 *  - onLogoUrlSave       : (url: string) => void
 *  - onPaletteApply      : ({ token, color }) => void  — preview-only, no Firestore
 */
const BrandingSection = ({
  customizationForm,
  institutionName,
  iconUploading,
  iconUploadError,
  onIconUpload,
  onIconUrlSave,
  onLogoUpload,
  onLogoUrlSave,
  onPaletteApply,
}: any) => (
  <section className="space-y-4">
    <div className="flex items-center gap-2 mb-1">
      <Palette className="w-5 h-5 text-indigo-500" />
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Identidad visual</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ImageCard
        type="icon"
        title="Icono del navegador"
        subtitle="Favicon — pestaña del navegador"
        url={customizationForm.iconUrl}
        isUploading={iconUploading}
        uploadError={iconUploadError}
        institutionLabel={institutionName}
        onFileUpload={onIconUpload}
        onUrlSave={onIconUrlSave}
        onPaletteApply={onPaletteApply}
      />

      <ImageCard
        type="logo"
        title="Logotipo institucional"
        subtitle="Encabezado de la aplicación"
        url={customizationForm.logoUrl}
        isUploading={iconUploading}
        uploadError={iconUploadError}
        institutionLabel={institutionName}
        onFileUpload={onLogoUpload}
        onUrlSave={onLogoUrlSave}
        onPaletteApply={onPaletteApply}
      />
    </div>
  </section>
);

export default BrandingSection;