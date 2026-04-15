// src/pages/InstitutionAdminDashboard/components/InstitutionCustomizationMockView.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  COLOR_TOKENS,
  DEFAULTS,
  VIEWPORTS,
  buildInstitutionPreviewThemeMessage,
} from './customization/themePreviewUtils';
import CustomizationHomeExactPreview from './customization/CustomizationHomeExactPreview';
import DashboardOverlayShell from '../../../components/ui/DashboardOverlayShell';

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

const buildThemeSetColorsFromForm = (source: any = {}) => {
  const safe = buildSafeForm(source, DEFAULTS);
  return {
    primary: safe.primary,
    secondary: safe.secondary,
    accent: safe.accent,
    cardBorder: safe.cardBorder,
  };
};

const InstitutionCustomizationMockView = ({
  previewUser = null,
  initialValues,
  themeSets = [],
  onSave,
  onSaveThemeSet,
  className = '',
  previewPaletteApply = null,
  previewMode = 'live',
  homeUrl = '/theme-preview?role=teacher',
}: any) => {
  const [form, setForm] = useState(buildSafeForm({ ...DEFAULTS, ...(initialValues || {}) }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeToken, setActiveToken] = useState<any>(null);
  const [previewRole, setPreviewRole] = useState('teacher');
  const [viewport, setViewport] = useState('desktop');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [themeSetName, setThemeSetName] = useState('');
  const [themeSetError, setThemeSetError] = useState('');
  const [themeSetSaving, setThemeSetSaving] = useState(false);
  const iframeRef = useRef<any>(null);

  const initialValuesKey = useMemo(() => JSON.stringify(initialValues || {}), [initialValues]);
  const resolvedThemeSets = useMemo(() => (Array.isArray(themeSets) ? themeSets : []), [themeSets]);

  // Depend only on the JSON-serialised key, not the object reference, so that a
  // parent re-render that produces a new object with the same values does NOT
  // reset in-progress colour edits the user has made.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const next = buildSafeForm({ ...DEFAULTS, ...(initialValues || {}) });
    setForm(next);
  }, [initialValuesKey]);

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

  const handleApplyThemeSet = useCallback((themeSet: any) => {
    const nextColors = buildThemeSetColorsFromForm(themeSet?.colors || {});
    setForm((previous: any) => buildSafeForm({ ...previous, ...nextColors }, previous));
    setSaved(false);
    setActiveToken(null);
  }, []);

  const handleSaveThemeSet = useCallback(async () => {
    if (typeof onSaveThemeSet !== 'function') return;

    const normalizedName = themeSetName.trim();
    if (!normalizedName) {
      setThemeSetError('Escribe un nombre para guardar el tema.');
      return;
    }

    setThemeSetSaving(true);
    setThemeSetError('');

    try {
      await onSaveThemeSet({
        name: normalizedName,
        colors: buildThemeSetColorsFromForm(form),
      });
      setThemeSetName('');
    } catch (error) {
      console.error('Error saving theme set from customization editor:', error);
      setThemeSetError('No se pudo guardar el tema personalizado.');
    } finally {
      setThemeSetSaving(false);
    }
  }, [onSaveThemeSet, themeSetName, form]);

  const handleFocus = useCallback((token: any) => {
    setActiveToken(token);
  }, []);

  const handleBlur = useCallback((event: any) => {
    if (event?.currentTarget?.contains(event?.relatedTarget)) return;
    setActiveToken(null);
  }, []);

  const handleReset = () => {
    const next = buildSafeForm({ ...DEFAULTS, ...(initialValues || {}) });
    setForm(next);
    setSaved(false);
    setActiveToken(null);
    setShowSaveConfirmation(false);
    setShowResetConfirmation(false);
  };

  const openSaveConfirmation = () => {
    setShowResetConfirmation(false);
    setShowSaveConfirmation(true);
  };

  const openResetConfirmation = () => {
    if (saving) return;
    setShowSaveConfirmation(false);
    setShowResetConfirmation(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(form);
      setSaved(true);
      setShowSaveConfirmation(false);
      window.setTimeout(() => setSaved(false), 2800);
    } finally {
      setSaving(false);
    }
  };

  const dispatchLivePreviewMessage = useCallback(() => {
    if (previewMode !== 'live' || !iframeReady) return;

    const iframeWindow = iframeRef.current?.contentWindow;
    if (!iframeWindow || typeof iframeWindow.postMessage !== 'function') return;

    const message = buildInstitutionPreviewThemeMessage({
      colors: buildSafeForm(form, DEFAULTS),
      activeToken,
      previewRole,
      previewUser,
    });

    iframeWindow.postMessage(message, window.location.origin);
  }, [previewMode, iframeReady, form, activeToken, previewRole, previewUser]);

  useEffect(() => {
    dispatchLivePreviewMessage();
  }, [dispatchLivePreviewMessage]);

  useEffect(() => {
    if (previewMode !== 'live') {
      setIframeReady(false);
    }
  }, [previewMode]);

  const viewportConfig = VIEWPORTS.find((entry) => entry.id === viewport) || VIEWPORTS[0];
  const institutionLabel = form.institutionName?.trim() || 'Tu Institución';
  const previewRoleLabel = previewRole === 'student' ? 'Cuenta simulada: Estudiante' : 'Cuenta simulada: Docente';
  const containerClassName = fullscreen
    ? 'fixed inset-0 z-[10050] flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950'
    : `flex h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-950 ${className}`;

  const roleButtons = [
    { id: 'teacher', label: 'Vista docente', Icon: GraduationCap },
    { id: 'student', label: 'Vista estudiante', Icon: Users },
  ];

  return (
    <>
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 mb-4">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre en pestaña del navegador</label>
      <input
        type="text"
        value={form.browserTabTitle || ''}
        onChange={(event) => handleChange('browserTabTitle', event.target.value)}
        className="w-full mt-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
        placeholder="Título en la pestaña del navegador"
      />
    </section>
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
                <p className="text-[11px] text-slate-400">{previewMode === 'live' ? 'Vista en vivo con iframe' : 'Vista simulada local'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 clean-scrollbar">
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

              <section>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Temas guardados</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={themeSetName}
                    onChange={(event) => setThemeSetName(event.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nombre del tema"
                    data-testid="theme-set-name-input"
                  />
                  <button
                    type="button"
                    onClick={handleSaveThemeSet}
                    disabled={themeSetSaving || saving}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-70"
                    style={{ backgroundColor: form.primary }}
                    data-testid="theme-set-save-button"
                  >
                    {themeSetSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    {themeSetSaving ? 'Guardando...' : 'Guardar tema'}
                  </button>
                </div>
                {themeSetError && (
                  <p className="mt-2 text-[11px] font-medium text-red-600 dark:text-red-300">{themeSetError}</p>
                )}

                <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1 minimal-scrollbar" data-testid="theme-set-list">
                  {resolvedThemeSets.length === 0 ? (
                    <p className="text-[11px] text-slate-400">Aún no hay temas guardados.</p>
                  ) : (
                    resolvedThemeSets.map((themeSet: any) => {
                      const safeColors = buildThemeSetColorsFromForm(themeSet?.colors || {});

                      return (
                        <div
                          key={themeSet.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/60 p-2.5"
                          data-testid={`theme-set-item-${themeSet.id}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={themeSet.name}>
                              {themeSet.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleApplyThemeSet(themeSet)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-[11px] font-semibold text-slate-600 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700"
                              data-testid={`theme-set-apply-${themeSet.id}`}
                            >
                              Aplicar
                            </button>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5">
                            {COLOR_FIELDS.map((token: any) => (
                              <span
                                key={token}
                                className="w-4 h-4 rounded border border-slate-200 dark:border-slate-700"
                                style={{ backgroundColor: safeColors[token] }}
                                title={`${token}: ${safeColors[token]}`}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 pt-1">
              <button
                type="button"
                onClick={openSaveConfirmation}
                disabled={saving}
                title="Guardar cambios"
                className="w-10 h-10 rounded-xl text-white inline-flex items-center justify-center disabled:opacity-70"
                style={{ backgroundColor: saved ? '#10b981' : form.primary }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
              </button>
              <button
                type="button"
                onClick={openResetConfirmation}
                disabled={saving}
                title="Restablecer colores"
                className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 inline-flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-70"
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
              onClick={openResetConfirmation}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-70"
            >
              <RotateCcw size={14} /> Restablecer
            </button>
            <button
              type="button"
              onClick={openSaveConfirmation}
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
            <p className="text-sm font-bold text-slate-900 dark:text-white">{previewMode === 'live' ? 'Vista previa en vivo de Home' : 'Vista previa exacta de Home'}</p>
            <p className="text-xs text-slate-400">{institutionLabel}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{previewRoleLabel}</p>
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

        <div className="flex-1 overflow-hidden p-5 bg-slate-200 dark:bg-slate-950">
          {previewMode === 'mock' ? (
            <CustomizationHomeExactPreview
              form={form}
              previewRole={previewRole}
              viewportWidth={viewportConfig.width}
              activeToken={activeToken}
            />
          ) : (
            <div
              className="relative mx-auto h-full min-h-[620px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.25)]"
              style={{ width: viewportConfig.width, maxWidth: '100%' }}
              data-testid="institution-customization-live-preview-shell"
            >
              {!iframeReady && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/95 dark:bg-slate-900/95">
                  <Loader2 size={22} className="animate-spin text-indigo-500" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Cargando vista previa en vivo...</p>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={homeUrl}
                title="Vista previa en vivo de la aplicación"
                onLoad={() => setIframeReady(true)}
                className="w-full h-full border-0"
              />
            </div>
          )}
        </div>

        {fullscreen && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400">
            Pulsa Esc para salir de pantalla completa.
          </div>
        )}
      </div>
    </div>
    <DashboardOverlayShell
      isOpen={showSaveConfirmation}
      onClose={() => setShowSaveConfirmation(false)}
      closeOnBackdropClick={!saving}
      maxWidth="md"
      contentClassName="p-0"
      rootClassName={fullscreen ? 'fixed inset-x-0 bottom-0 z-[10100] overflow-y-auto clean-scrollbar' : undefined}
      rootStyle={fullscreen ? { top: 0 } : undefined}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Confirmar guardado</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Estos cambios actualizarán la personalización institucional para todos los usuarios del centro.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowSaveConfirmation(false)}
            disabled={saving}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-70"
            style={{ backgroundColor: form.primary }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </DashboardOverlayShell>
    <DashboardOverlayShell
      isOpen={showResetConfirmation}
      onClose={() => setShowResetConfirmation(false)}
      closeOnBackdropClick={!saving}
      maxWidth="md"
      contentClassName="p-0"
      rootClassName={fullscreen ? 'fixed inset-x-0 bottom-0 z-[10100] overflow-y-auto clean-scrollbar' : undefined}
      rootStyle={fullscreen ? { top: 0 } : undefined}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Confirmar restablecimiento</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Se descartarán los cambios sin guardar y se restaurarán los valores iniciales de personalización.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowResetConfirmation(false)}
            disabled={saving}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-70"
            style={{ backgroundColor: form.secondary }}
          >
            <RotateCcw size={14} />
            Restablecer
          </button>
        </div>
      </div>
    </DashboardOverlayShell>
    </>
  );
};

export default InstitutionCustomizationMockView;
