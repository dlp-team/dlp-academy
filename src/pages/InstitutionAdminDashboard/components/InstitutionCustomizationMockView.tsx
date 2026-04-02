// src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Eye,
  GraduationCap,
  Loader2,
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

  const roleButtons = [
    { id: 'teacher', label: 'Vista docente', Icon: GraduationCap },
    { id: 'student', label: 'Vista estudiante', Icon: Users },
  ];

  return (
    <div className={`flex h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-950 ${className}`}>
      <aside className="w-80 max-w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: form.primary }}>
              <Palette size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Editor de tema</p>
              <p className="text-[11px] text-slate-400">Vista exacta de Home (docente/estudiante)</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
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

        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
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
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
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
      </div>
    </div>
  );
};

export default InstitutionCustomizationMockView;
