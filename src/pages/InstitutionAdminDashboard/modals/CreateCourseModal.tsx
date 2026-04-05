// src/pages/InstitutionAdminDashboard/modals/CreateCourseModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Course name is built from two separate fields:
//   • courseNumber  – positive integer  (e.g. 1)
//   • courseName    – free text         (e.g. "ESO")
//   → combined name = "1º ESO"
//
// Both are stored individually on the Firestore doc so the UI can reconstruct
// them for editing. The composed `name` field is also stored for cheap queries.

import React, { useMemo, useState } from 'react';
import { CalendarRange, Hash, Loader2, Save, Type, XCircle } from 'lucide-react';
import {
  ColorPicker,
  ghostBtnCls,
  InputField,
  inputCls,
  Modal,
  primaryBtnCls,
} from '../components/classes-courses/Shared';
import AcademicYearPicker from '../components/classes-courses/AcademicYearPicker';
import {
  getDefaultAcademicYear,
  isValidAcademicYear,
  normalizeAcademicYear,
} from '../components/classes-courses/academicYearUtils';
import {
  buildCoursePeriodDefinitions,
  buildDefaultCoursePeriodSchedule,
  normalizeCoursePeriodMode,
  normalizeCoursePeriodSchedule,
} from '../../../utils/coursePeriodScheduleUtils';

const DEFAULT_PERIOD_CONFIG = {
  periodMode: 'trimester',
  customPeriodLabel: '',
  academicCalendar: {
    startDate: '',
    ordinaryEndDate: '',
    extraordinaryEndDate: '',
  },
};

const CreateCourseModal = ({ onClose, onSubmit, submitting, error, periodConfig = DEFAULT_PERIOD_CONFIG }: any) => {
  const [courseNumber, setCourseNumber] = useState('');
  const [courseName, setCourseName] = useState('');
  const [academicYear, setAcademicYear] = useState(getDefaultAcademicYear());
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [enableCoursePeriodSchedule, setEnableCoursePeriodSchedule] = useState(false);
  const [periodRows, setPeriodRows] = useState<any[]>([]);
  const [extraordinaryEndDate, setExtraordinaryEndDate] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  const resolvedPeriodMode = normalizeCoursePeriodMode(periodConfig?.periodMode);
  const resolvedCustomPeriodLabel = String(periodConfig?.customPeriodLabel || '').trim();
  const resolvedAcademicCalendar = periodConfig?.academicCalendar || DEFAULT_PERIOD_CONFIG.academicCalendar;

  const periodDefinitions = useMemo(() => (
    buildCoursePeriodDefinitions({
      periodMode: resolvedPeriodMode,
      customPeriodLabel: resolvedCustomPeriodLabel,
    })
  ), [resolvedPeriodMode, resolvedCustomPeriodLabel]);

  const periodRowsByIndex = useMemo(() => {
    const byIndex = new Map<any, any>();
    periodRows.forEach((entry: any) => {
      const normalizedIndex = Number(entry?.periodIndex);
      if (Number.isFinite(normalizedIndex)) {
        byIndex.set(Math.max(1, Math.floor(normalizedIndex)), entry);
      }
    });
    return byIndex;
  }, [periodRows]);

  const resolvedPeriodRows = useMemo(() => (
    periodDefinitions.map((definition: any) => {
      const existingRow = periodRowsByIndex.get(definition.periodIndex) || {};
      return {
        periodIndex: definition.periodIndex,
        periodLabel: definition.periodLabel,
        periodStartAt: String(existingRow?.periodStartAt || '').trim(),
        periodEndAt: String(existingRow?.periodEndAt || '').trim(),
      };
    })
  ), [periodDefinitions, periodRowsByIndex]);

  const initializePeriodSchedule = (nextAcademicYear: any) => {
    const defaults = buildDefaultCoursePeriodSchedule({
      academicYear: normalizeAcademicYear(nextAcademicYear),
      periodMode: resolvedPeriodMode,
      customPeriodLabel: resolvedCustomPeriodLabel,
      academicCalendar: resolvedAcademicCalendar,
    });

    setPeriodRows(Array.isArray(defaults?.periods) ? defaults.periods : []);
    setExtraordinaryEndDate(String(defaults?.extraordinaryEndDate || '').trim());
  };

  const togglePeriodSchedule = () => {
    const nextEnabled = !enableCoursePeriodSchedule;
    setEnableCoursePeriodSchedule(nextEnabled);
    setScheduleError('');

    if (nextEnabled) {
      initializePeriodSchedule(academicYear);
    }
  };

  const updatePeriodRowField = (periodIndex: number, fieldKey: string, fieldValue: string) => {
    setScheduleError('');
    setPeriodRows((previous: any) => {
      const hasRow = previous.some((entry: any) => Number(entry?.periodIndex) === periodIndex);
      if (!hasRow) {
        return [
          ...previous,
          {
            periodIndex,
            periodLabel: periodDefinitions.find((entry: any) => entry.periodIndex === periodIndex)?.periodLabel || '',
            [fieldKey]: fieldValue,
          },
        ];
      }

      return previous.map((entry: any) => (
        Number(entry?.periodIndex) === periodIndex
          ? { ...entry, [fieldKey]: fieldValue }
          : entry
      ));
    });
  };

  // Derive the composed name live
  const num = parseInt(courseNumber, 10);
  const numStr = Number.isInteger(num) && num > 0 ? `${num}º` : '';
  const preview = [numStr, courseName.trim()].filter(Boolean).join(' ');

  const isAcademicYearValid = isValidAcademicYear(academicYear);
  const isValid = preview.trim().length > 0 && isAcademicYearValid;
  const hasUnsavedChanges = Boolean(
    courseNumber.trim().length > 0
    || courseName.trim().length > 0
    || description.trim().length > 0
    || academicYear !== getDefaultAcademicYear()
    || color !== '#6366f1'
    || enableCoursePeriodSchedule
    || extraordinaryEndDate.trim().length > 0
    || resolvedPeriodRows.some((entry: any) => entry.periodStartAt || entry.periodEndAt)
  );

  const validateCoursePeriodSchedule = () => {
    if (!enableCoursePeriodSchedule) {
      return { valid: true, normalizedSchedule: null, message: '' };
    }

    const hasMissingPeriodDates = resolvedPeriodRows.some((entry: any) => !entry.periodStartAt || !entry.periodEndAt);
    if (hasMissingPeriodDates) {
      return {
        valid: false,
        normalizedSchedule: null,
        message: 'Completa las fechas de inicio y fin de cada periodo para guardar este calendario.',
      };
    }

    const normalizedSchedule = normalizeCoursePeriodSchedule({
      coursePeriodSchedule: {
        periodType: resolvedPeriodMode,
        customLabel: resolvedCustomPeriodLabel,
        periods: resolvedPeriodRows,
        extraordinaryEndDate: extraordinaryEndDate || null,
      },
      periodMode: resolvedPeriodMode,
      customPeriodLabel: resolvedCustomPeriodLabel,
    });

    if (!normalizedSchedule) {
      return {
        valid: false,
        normalizedSchedule: null,
        message: 'El calendario por periodos tiene fechas solapadas o inválidas. Revisa el orden cronológico.',
      };
    }

    return {
      valid: true,
      normalizedSchedule,
      message: '',
    };
  };

  const periodModeLabel = resolvedPeriodMode === 'cuatrimester'
    ? 'cuatrimestres'
    : resolvedPeriodMode === 'custom'
      ? `periodo personalizado (${resolvedCustomPeriodLabel || 'Periodo'})`
      : 'trimestres';

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!isValid) return;

    const scheduleValidation = validateCoursePeriodSchedule();
    if (!scheduleValidation.valid) {
      setScheduleError(scheduleValidation.message);
      return;
    }

    setScheduleError('');
    onSubmit({
      courseNumber: Number.isInteger(num) && num > 0 ? num : null,
      courseName: courseName.trim(),
      name: preview, // composed, stored for display/queries
      academicYear: normalizeAcademicYear(academicYear),
      description,
      color,
      coursePeriodSchedule: scheduleValidation.normalizedSchedule,
    });
  };

  return (
    <Modal
      title="Nuevo Curso"
      onClose={onClose}
      hasUnsavedChanges={hasUnsavedChanges}
      confirmOnUnsavedClose
    >
      {({ requestClose }: any) => (
        <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Number + Name row ── */}
        <div className="flex gap-3 items-end">
          {/* Number */}
          <div className="w-28 shrink-0">
            <InputField label="Número" required>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  placeholder="1"
                  value={courseNumber}
                  onChange={(e) => setCourseNumber(e.target.value)}
                  className={`${inputCls} pl-8`}
                  autoFocus
                />
              </div>
            </InputField>
          </div>

          {/* Name */}
          <div className="flex-1">
            <InputField label="Nombre del curso" required>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ESO, Bachillerato, FP…"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className={`${inputCls} pl-8`}
                />
              </div>
            </InputField>
          </div>
        </div>

        {/* ── Live preview ── */}
        {preview ? (
          <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 mb-0.5">Nombre completo del curso</p>
            <p className="text-base font-bold text-slate-800 dark:text-white">{preview}</p>
          </div>
        ) : (
          <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 italic text-center">
              El nombre se construye automáticamente - ej: <strong>1º ESO</strong>
            </p>
          </div>
        )}

        {/* ── Description ── */}
        <InputField label="Año académico" required>
          <AcademicYearPicker
            value={academicYear}
            onChange={(nextAcademicYear) => {
              setAcademicYear(nextAcademicYear);
              if (enableCoursePeriodSchedule) {
                initializePeriodSchedule(nextAcademicYear);
              }
            }}
            placeholder="2024-2025"
          />
          <p className="mt-1 text-xs text-slate-400">
            Formato obligatorio YYYY-YYYY. Se usa como fuente canónica para las clases del curso.
          </p>
          {!isAcademicYearValid && (
            <p className="mt-1 text-xs font-medium text-red-500">
              El año académico debe tener formato YYYY-YYYY y representar años consecutivos.
            </p>
          )}
        </InputField>

        <InputField label="Calendario por periodos del curso">
          <label className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <input
              type="checkbox"
              checked={enableCoursePeriodSchedule}
              onChange={togglePeriodSchedule}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Definir fechas propias para {periodModeLabel}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Si se activa, estas fechas se usarán al crear asignaturas de este curso. Si no, se aplica el calendario institucional.
              </p>
            </div>
          </label>

          {enableCoursePeriodSchedule && (
            <div className="mt-3 space-y-3">
              {resolvedPeriodRows.map((row: any) => (
                <div
                  key={`course-period-row-${row.periodIndex}`}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3"
                >
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    {row.periodLabel}
                  </p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="space-y-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Inicio</span>
                      <input
                        type="date"
                        value={row.periodStartAt}
                        onChange={(event) => updatePeriodRowField(row.periodIndex, 'periodStartAt', event.target.value)}
                        className={`${inputCls} py-2`}
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Fin ordinario</span>
                      <input
                        type="date"
                        value={row.periodEndAt}
                        onChange={(event) => updatePeriodRowField(row.periodIndex, 'periodEndAt', event.target.value)}
                        className={`${inputCls} py-2`}
                      />
                    </label>
                  </div>
                </div>
              ))}

              <label className="space-y-1 block">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 inline-flex items-center gap-1">
                  <CalendarRange className="w-3.5 h-3.5" />
                  Fin extraordinario del curso
                </span>
                <input
                  type="date"
                  value={extraordinaryEndDate}
                  onChange={(event) => {
                    setScheduleError('');
                    setExtraordinaryEndDate(event.target.value);
                  }}
                  className={`${inputCls} py-2`}
                />
              </label>
            </div>
          )}

          {scheduleError && (
            <p className="mt-2 text-xs font-medium text-red-500">{scheduleError}</p>
          )}
        </InputField>

        {/* ── Description ── */}
        <InputField label="Descripción">
          <textarea
            placeholder="Descripción opcional…"
            value={description}
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </InputField>

        {/* ── Color ── */}
        <InputField label="Color de identificación">
          <ColorPicker value={color} onChange={setColor} />
        </InputField>

        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <XCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={requestClose} className={ghostBtnCls}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting || !isValid} className={primaryBtnCls}>
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Save className="w-4 h-4" /> Crear curso</>}
          </button>
        </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateCourseModal;