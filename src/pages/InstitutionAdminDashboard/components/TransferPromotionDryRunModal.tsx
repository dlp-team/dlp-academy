// src/pages/InstitutionAdminDashboard/components/TransferPromotionDryRunModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRightLeft, Loader2, ShieldCheck } from 'lucide-react';
import { getAcademicYearStartYear } from './classes-courses/academicYearUtils';

const buildNextAcademicYear = (academicYear: any) => {
  const startYear = getAcademicYearStartYear(academicYear);
  if (startYear === null) return '';
  return `${startYear + 1}-${startYear + 2}`;
};

const TransferPromotionDryRunModal = ({
  isOpen,
  onClose,
  availableAcademicYears = [],
  onRunDryRun,
}: any) => {
  const [sourceAcademicYear, setSourceAcademicYear] = useState('');
  const [targetAcademicYear, setTargetAcademicYear] = useState('');
  const [mode, setMode] = useState('promote');
  const [copyStudentLinks, setCopyStudentLinks] = useState(true);
  const [includeClassMemberships, setIncludeClassMemberships] = useState(true);
  const [preserveVisibility, setPreserveVisibility] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    const defaultSourceAcademicYear = String(availableAcademicYears?.[0] || '').trim();
    const defaultTargetAcademicYear = buildNextAcademicYear(defaultSourceAcademicYear);

    setSourceAcademicYear(defaultSourceAcademicYear);
    setTargetAcademicYear(defaultTargetAcademicYear);
    setMode('promote');
    setCopyStudentLinks(true);
    setIncludeClassMemberships(true);
    setPreserveVisibility(false);
    setErrorMessage('');
    setSummary(null);
  }, [isOpen, availableAcademicYears]);

  const academicYearOptions = useMemo(() => {
    const optionSet = new Set<string>();
    (availableAcademicYears || []).forEach((academicYear: any) => {
      const normalized = String(academicYear || '').trim();
      if (normalized) optionSet.add(normalized);
    });

    const suggestedNext = buildNextAcademicYear(sourceAcademicYear);
    if (suggestedNext) optionSet.add(suggestedNext);

    return Array.from(optionSet).sort((left, right) => {
      const leftStart = getAcademicYearStartYear(left);
      const rightStart = getAcademicYearStartYear(right);
      if (leftStart === null && rightStart === null) return String(left).localeCompare(String(right));
      if (leftStart === null) return 1;
      if (rightStart === null) return -1;
      return rightStart - leftStart;
    });
  }, [availableAcademicYears, sourceAcademicYear]);

  const canExecute = Boolean(sourceAcademicYear && targetAcademicYear && sourceAcademicYear !== targetAcademicYear && !isExecuting);

  if (!isOpen) return null;

  const closeModal = () => {
    if (isExecuting) return;
    onClose?.();
  };

  const handleSourceAcademicYearChange = (nextSourceAcademicYear: any) => {
    const normalizedSource = String(nextSourceAcademicYear || '').trim();
    setSourceAcademicYear(normalizedSource);
    const nextAcademicYear = buildNextAcademicYear(normalizedSource);
    if (!targetAcademicYear || targetAcademicYear === sourceAcademicYear) {
      setTargetAcademicYear(nextAcademicYear);
    }
  };

  const executeDryRun = async () => {
    if (!canExecute || !onRunDryRun) return;

    setIsExecuting(true);
    setErrorMessage('');
    setSummary(null);

    try {
      const result = await onRunDryRun({
        sourceAcademicYear,
        targetAcademicYear,
        mode,
        options: {
          copyStudentLinks,
          includeClassMemberships,
          preserveVisibility,
        },
      });
      setSummary(result);
    } catch (error: any) {
      const rawMessage = String(error?.message || '').trim();
      if (!rawMessage) {
        setErrorMessage('No se pudo ejecutar la simulación. Revisa los datos e inténtalo de nuevo.');
      } else if (rawMessage === 'MISSING_INSTITUTION') {
        setErrorMessage('No se encontró una institución válida para ejecutar la simulación.');
      } else {
        setErrorMessage(rawMessage);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/60" onClick={closeModal} />

      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="p-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
            Simulación de traslado/promoción
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Ejecuta una simulación en seco para revisar cursos, clases y asignaciones antes de aplicar cambios reales.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs text-slate-600 dark:text-slate-300">
              Año académico origen
              <select
                value={sourceAcademicYear}
                onChange={(event) => handleSourceAcademicYearChange(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">Selecciona un año</option>
                {academicYearOptions.map((academicYear: any) => (
                  <option key={`source-${academicYear}`} value={academicYear}>{academicYear}</option>
                ))}
              </select>
            </label>

            <label className="text-xs text-slate-600 dark:text-slate-300">
              Año académico destino
              <select
                value={targetAcademicYear}
                onChange={(event) => setTargetAcademicYear(event.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">Selecciona un año</option>
                {academicYearOptions.map((academicYear: any) => (
                  <option key={`target-${academicYear}`} value={academicYear}>{academicYear}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('promote')}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                mode === 'promote'
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              <p className="font-semibold">Promoción</p>
              <p className="text-xs mt-1">Mantiene vínculos actuales y agrega los del año destino.</p>
            </button>
            <button
              type="button"
              onClick={() => setMode('transfer')}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                mode === 'transfer'
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-200'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              }`}
            >
              <p className="font-semibold">Traslado</p>
              <p className="text-xs mt-1">Reemplaza vínculos del año origen por los del destino.</p>
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Opciones de simulación</p>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={copyStudentLinks}
                onChange={(event) => setCopyStudentLinks(event.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              Copiar vinculación de alumnos entre cursos
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={includeClassMemberships}
                onChange={(event) => setIncludeClassMemberships(event.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
                disabled={!copyStudentLinks}
              />
              Incluir membresías de clase en la simulación
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={preserveVisibility}
                onChange={(event) => setPreserveVisibility(event.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              Preservar visibilidad actual (solo referencia en simulación)
            </label>
          </div>

          {errorMessage && (
            <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> {errorMessage}
            </p>
          )}

          {summary?.summary && (
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4 text-sm text-slate-700 dark:text-slate-200 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Resumen de simulación
              </p>
              <p>Cursos origen analizados: <strong>{summary.summary.sourceCourses}</strong></p>
              <p>Clases origen analizadas: <strong>{summary.summary.sourceClasses}</strong></p>
              <p>Mapeos de cursos planificados: <strong>{summary.summary.plannedCourseMappings}</strong></p>
              <p>Mapeos de clases planificados: <strong>{summary.summary.plannedClassMappings}</strong></p>
              <p>Alumnos con asignaciones planificadas: <strong>{summary.summary.plannedStudentAssignments}</strong></p>
              {summary?.rollbackMetadata?.rollbackId && (
                <p>Referencia de rollback: <strong>{summary.rollbackMetadata.rollbackId}</strong></p>
              )}
              {Array.isArray(summary?.warnings) && summary.warnings.length > 0 && (
                <p>Advertencias: <strong>{summary.warnings.join(' | ')}</strong></p>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={isExecuting}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={executeDryRun}
              disabled={!canExecute}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 inline-flex items-center gap-2"
            >
              {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Ejecutar simulación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferPromotionDryRunModal;
