// src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
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
import { COLOR_TOKENS, DEFAULTS, VIEWPORTS, hexToRgba } from './customization/themePreviewUtils';

const COLOR_FIELDS = ['primary', 'secondary', 'accent', 'cardBorder'];

const TOKEN_ICON_MAP = {
  primary: <Palette size={12} />,
  secondary: <ShieldCheck size={12} />,
  accent: <Sparkles size={12} />,
  cardBorder: <Eye size={12} />,
};

const isValidHexColor = (value) => (
  typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())
);

const buildSafeForm = (candidate, fallback = DEFAULTS) => {
  const source = candidate || {};
  const safe = { ...source };

  COLOR_FIELDS.forEach((field) => {
    const nextValue = source[field];
    safe[field] = isValidHexColor(nextValue) ? nextValue : fallback[field];
  });

  return safe;
};

const TeacherMockPreview = ({ form, activeToken }) => {
  const borderStyle = { borderColor: form.cardBorder };
  const activeOutline = activeToken
    ? { boxShadow: `0 0 0 2px ${hexToRgba(form[activeToken], 0.45)}` }
    : {};

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${form.primary}, ${form.secondary})`,
          ...activeOutline,
        }}
      >
        <p className="text-xs uppercase tracking-wide opacity-90">Panel Docente</p>
        <h3 className="text-lg font-bold mt-1">Resumen de curso</h3>
        <p className="text-xs opacity-90 mt-1">3 clases activas · 82 alumnos</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border bg-white p-3" style={borderStyle}>
          <p className="text-xs text-slate-500">Asistencia semanal</p>
          <p className="text-2xl font-black mt-1" style={{ color: form.primary }}>94%</p>
        </div>
        <div className="rounded-xl border bg-white p-3" style={borderStyle}>
          <p className="text-xs text-slate-500">Evaluaciones corregidas</p>
          <p className="text-2xl font-black mt-1" style={{ color: form.secondary }}>27</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-3" style={borderStyle}>
        <p className="text-sm font-semibold text-slate-700 mb-2">Reconocimientos recientes</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-2.5 py-2">
            <span className="text-slate-600">Laura Ruiz</span>
            <span className="px-2 py-1 rounded-full font-semibold text-white" style={{ backgroundColor: form.accent }}>Participación</span>
          </div>
          <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-2.5 py-2">
            <span className="text-slate-600">Diego Martín</span>
            <span className="px-2 py-1 rounded-full font-semibold text-white" style={{ backgroundColor: form.accent }}>Esfuerzo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentMockPreview = ({ form, activeToken }) => {
  const borderStyle = { borderColor: form.cardBorder };
  const activeOutline = activeToken
    ? { boxShadow: `0 0 0 2px ${hexToRgba(form[activeToken], 0.45)}` }
    : {};

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl p-4 text-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${form.secondary}, ${form.primary})`,
          ...activeOutline,
        }}
      >
        <p className="text-xs uppercase tracking-wide opacity-90">Panel Estudiante</p>
        <h3 className="text-lg font-bold mt-1">Tu progreso</h3>
        <p className="text-xs opacity-90 mt-1">Promedio 86 · 4 logros desbloqueados</p>
      </div>

      <div className="rounded-xl border bg-white p-3" style={borderStyle}>
        <p className="text-sm font-semibold text-slate-700 mb-2">Próximas actividades</p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between rounded-lg px-2.5 py-2" style={{ backgroundColor: hexToRgba(form.primary, 0.08) }}>
            <span className="text-slate-600">Quiz de Matemáticas</span>
            <span className="font-semibold" style={{ color: form.primary }}>Mañana</span>
          </div>
          <div className="flex items-center justify-between rounded-lg px-2.5 py-2" style={{ backgroundColor: hexToRgba(form.secondary, 0.08) }}>
            <span className="text-slate-600">Entrega de Historia</span>
            <span className="font-semibold" style={{ color: form.secondary }}>Viernes</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border bg-white p-3 text-center" style={borderStyle}>
          <p className="text-[10px] uppercase text-slate-400">Insignias</p>
          <p className="text-xl font-black mt-1" style={{ color: form.accent }}>6</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center" style={borderStyle}>
          <p className="text-[10px] uppercase text-slate-400">Temas</p>
          <p className="text-xl font-black mt-1" style={{ color: form.primary }}>18</p>
        </div>
        <div className="rounded-xl border bg-white p-3 text-center" style={borderStyle}>
          <p className="text-[10px] uppercase text-slate-400">Racha</p>
          <p className="text-xl font-black mt-1" style={{ color: form.secondary }}>9</p>
        </div>
      </div>
    </div>
  );
};

const InstitutionCustomizationMockView = ({
  initialValues,
  onSave,
  className = '',
  previewPaletteApply = null,
}) => {
  const [form, setForm] = useState(buildSafeForm({ ...DEFAULTS, ...(initialValues || {}) }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeToken, setActiveToken] = useState(null);
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

    setForm((previous) => buildSafeForm({
      ...previous,
      [previewPaletteApply.token]: previewPaletteApply.color,
    }, previous));
    setActiveToken(previewPaletteApply.token);
    setSaved(false);
  }, [previewPaletteApply]);

  const handleChange = useCallback((field, value) => {
    setForm((previous) => buildSafeForm({ ...previous, [field]: value }, previous));
    setSaved(false);
  }, []);

  const handleFocus = useCallback((token) => {
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
              <p className="text-[11px] text-slate-400">Vista mock docente/estudiante</p>
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
              {COLOR_TOKENS.map((token) => (
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
            <p className="text-sm font-bold text-slate-900 dark:text-white">Vista previa simulada</p>
            <p className="text-xs text-slate-400">{institutionLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-1">
              {roleButtons.map((roleButton) => (
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
              {VIEWPORTS.map((viewportOption) => (
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

        <div className="flex-1 overflow-auto p-5 bg-slate-200 dark:bg-slate-950 flex justify-center">
          <div
            className="w-full rounded-2xl border bg-white p-4 shadow-xl transition-all"
            style={{
              maxWidth: viewportConfig.width,
              borderColor: form.cardBorder,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: form.primary }}>
                  <BookOpen size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{institutionLabel}</p>
                  <p className="text-[11px] text-slate-400">Tema institucional activo</p>
                </div>
              </div>
              <span
                className="px-2 py-1 rounded-full text-[11px] font-semibold"
                style={{
                  backgroundColor: hexToRgba(form.accent, 0.16),
                  color: form.accent,
                }}
              >
                Preview
              </span>
            </div>

            {previewRole === 'teacher' ? (
              <TeacherMockPreview form={form} activeToken={activeToken} />
            ) : (
              <StudentMockPreview form={form} activeToken={activeToken} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionCustomizationMockView;
