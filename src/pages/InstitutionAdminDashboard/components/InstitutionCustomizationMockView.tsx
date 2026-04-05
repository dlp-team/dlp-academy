// src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  GraduationCap,
  Loader2,
  Maximize2,
  Minimize2,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import ColorField from './customization/ColorField';
import { COLOR_TOKENS, DEFAULTS, VIEWPORTS } from './customization/themePreviewUtils';
import CustomizationHomeExactPreview from './customization/CustomizationHomeExactPreview';

const COLOR_FIELDS = ['primary', 'secondary', 'accent', 'cardBorder'];

const TOKEN_ICON_MAP = {
  primary: <Palette size={12} />,
  secondary: <ShieldCheck size={12} />,
  accent: <Sparkles size={12} />,
  cardBorder: <Eye size={12} />,
};

const isValidHexColor = (value: any) => (
  typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
);

const buildSafeForm = (candidate: any, fallback: any = DEFAULTS) => {
  const source = candidate || {};
  const safe = { ...source };

  COLOR_FIELDS.forEach((field: any) => {
    const nextValue = source[field];
    safe[field] = isValidHexColor(nextValue) ? nextValue : fallback[field];
  });

  return safe;
};

const InstitutionCustomizationMockView = ({
  initialValues,
  onSave,
  className = '',
  previewPaletteApply = null,
}: any) => {
  const [form, setForm] = useState(buildSafeForm({ ...DEFAULTS, ...(initialValues || {}) }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [previewRole, setPreviewRole] = useState('teacher');
  const [viewport, setViewport] = useState('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const initialValuesKey = useMemo(() => JSON.stringify(initialValues || {}), [initialValues]);

  useEffect(() => {
    const next = buildSafeForm({ ...DEFAULTS, ...(initialValues || {}) });
    setForm(next);
  }, [initialValuesKey, initialValues]);

  useEffect(() => {
    if (!previewPaletteApply?.token || !previewPaletteApply?.color) return;
    if (!COLOR_FIELDS.includes(previewPaletteApply.token)) return;

    setForm((previous: any) => buildSafeForm({
      ...previous,
      [previewPaletteApply.token]: previewPaletteApply.color,
    }, previous));
    setActiveToken(previewPaletteApply.token);
    setSaved(false);
  }, [previewPaletteApply]);

  useEffect(() => {
    const onEscape = (event: any) => {
      if (event.key === 'Escape' && fullscreen) {
        setFullscreen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  const handleChange = useCallback((field: any, value: any) => {
    setForm((previous: any) => buildSafeForm({ ...previous, [field]: value }, previous));
    setSaved(false);
  }, []);

  const handleFocus = useCallback((token: any) => {
    setActiveToken(token);
  }, []);

  const handleBlur = useCallback(() => {}, []);

  const handleReset = () => {
    const next = buildSafeForm({ ...DEFAULTS, ...(initialValues || {}) });
    setForm(next);
    setSaved(false);
    setActiveToken(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(form);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2800);
    } finally {
      setSaving(false);
    }
  };

  const viewportConfig = VIEWPORTS.find((entry) => entry.id === viewport) || VIEWPORTS[0];
  const institutionLabel = form.institutionName?.trim() || 'Tu Institución';
  const containerClassName = fullscreen
    ? 'fixed inset-0 z-[10050] flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950'
    : `flex h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-950 ${className}`;

  const roleButtons = [
    { id: 'teacher', label: 'Vista docente', Icon: GraduationCap },
    { id: 'student', label: 'Vista estudiante', Icon: Users },
  ];

  return (
    <div className={containerClassName} data-testid="institution-customization-preview-root">
      <aside
        className={`relative h-full shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-[width] duration-300 ease-in-out ${
          sidebarOpen ? 'w-80' : 'w-16'
        }`}
      >
        <div className={`px-3 py-3 border-b border-slate-100 dark:border-slate-800 ${sidebarOpen ? '' : 'flex justify-center'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: form.primary }}>
              <Palette size={16} />
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Editor de tema</p>
                <p className="text-[11px] text-slate-400">Vista exacta de Home (docente/estudiante)</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
          {sidebarOpen ? (
            <div className="space-y-4">
              <section>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre de la institución</label>
                <input
                  type="text"
                  value={form.institutionName || ''}
                  onChange={(event) => handleChange('institutionName', event.target.value)}
                  className="w-full mt-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nombre visible"
                />
              </section>

              <section>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Colores</label>
                <div className="mt-2 space-y-2">
                  {COLOR_TOKENS.map((token: any) => (
                    <ColorField
                      key={token.id}
                      token={token.id}
                      label={token.label}
                      description={token.description}
                      icon={TOKEN_ICON_MAP[token.id] || <Palette size={12} />}
                      value={form[token.id]}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      isActive={activeToken === token.id}
                    />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                title="Guardar cambios"
                className="w-10 h-10 rounded-xl text-white inline-flex items-center justify-center disabled:opacity-70"
                style={{ backgroundColor: saved ? '#10b981' : form.primary }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Restablecer colores"
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 inline-flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RotateCcw size={14} /> Restablecer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-70"
              style={{ backgroundColor: saved ? '#10b981' : form.primary }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
              {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar'}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setSidebarOpen((previous: any) => !previous)}
          title={sidebarOpen ? 'Colapsar panel de controles' : 'Expandir panel de controles'}
          className="absolute -right-3.5 top-14 w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg text-slate-500 dark:text-slate-300 inline-flex items-center justify-center"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      <div className="flex-1 min-w-0 h-full flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Vista previa exacta de Home</p>
            <p className="text-xs text-slate-400">{institutionLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1">
              {roleButtons.map((roleButton: any) => (
                <button
                  key={roleButton.id}
                  type="button"
                  onClick={() => setPreviewRole(roleButton.id)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
                  style={previewRole === roleButton.id ? { backgroundColor: form.primary, color: '#fff' } : { color: '#64748b' }}
                >
                  <roleButton.Icon size={13} /> {roleButton.label}
                </button>
              ))}
            </div>

            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1">
              {VIEWPORTS.map((viewportOption: any) => (
                <button
                  key={viewportOption.id}
                  type="button"
                  title={viewportOption.label}
                  onClick={() => setViewport(viewportOption.id)}
                  className="p-1.5 rounded-lg transition"
                  style={viewport === viewportOption.id ? { backgroundColor: form.secondary, color: '#fff' } : { color: '#64748b' }}
                >
                  <viewportOption.Icon size={13} />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFullscreen((previous: any) => !previous)}
              title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5 bg-slate-200 dark:bg-slate-950">
          <CustomizationHomeExactPreview
            form={form}
            previewRole={previewRole}
            viewportWidth={viewportConfig.width}
            activeToken={activeToken}
          />
        </div>

        {fullscreen && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
            Pulsa Esc para salir de pantalla completa.
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionCustomizationMockView;
