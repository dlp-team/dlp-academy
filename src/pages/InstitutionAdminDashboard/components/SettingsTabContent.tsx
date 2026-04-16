// src/pages/InstitutionAdminDashboard/components/SettingsTabContent.tsx
import React from 'react';
import { AlertCircle, ArrowUpDown, CalendarDays, CheckCircle2, Loader2, Settings2, ShieldCheck, Sparkles } from 'lucide-react';
import CoursePromotionOrderEditor from './settings/CoursePromotionOrderEditor';
import { buildCoursePeriodDefinitions } from '../../../utils/coursePeriodScheduleUtils';

const SettingsTabContent = ({
  loading,
  saving,
  canSave,
  settingsForm,
  setSettingsForm,
  settingsMessage,
  onSave,
}: any) => {
  const setField = (key: any, value: any) => {
    setSettingsForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const setPeriodDateField = (periodIndex: number, field: 'periodStartAt' | 'periodEndAt', value: string) => {
    setSettingsForm((prev: any) => {
      const currentDates: any[] = Array.isArray(prev.periodDates) ? prev.periodDates : [];
      const existingIdx = currentDates.findIndex((d: any) => Number(d.periodIndex) === periodIndex);
      const existing = existingIdx >= 0 ? currentDates[existingIdx] : { periodIndex, periodStartAt: '', periodEndAt: '' };
      const updated = { ...existing, [field]: value };
      const next = [...currentDates];
      if (existingIdx >= 0) next[existingIdx] = updated;
      else next.push(updated);
      return { ...prev, periodDates: next };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3 mb-5">
          <Settings2 className="w-5 h-5 text-indigo-500 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Configuración académica</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Define el calendario académico institucional y cómo se organizan los periodos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              Inicio del año académico
            </span>
            <input
              type="date"
              value={settingsForm.academicYearStartDate}
              onChange={(e) => setField('academicYearStartDate', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fin ordinario</span>
            <input
              type="date"
              value={settingsForm.ordinaryEndDate}
              onChange={(e) => setField('ordinaryEndDate', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fin extraordinario</span>
            <input
              type="date"
              value={settingsForm.extraordinaryEndDate}
              onChange={(e) => setField('extraordinaryEndDate', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Organización del periodo</span>
            <select
              value={settingsForm.periodMode}
              onChange={(e) => setField('periodMode', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="trimester">Trimestres</option>
              <option value="cuatrimester">Cuatrimestres</option>
              <option value="custom">Personalizado</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Política al finalizar curso</span>
            <select
              value={settingsForm.postCoursePolicy}
              onChange={(e) => setField('postCoursePolicy', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="retain_all_no_join">Mantener acceso a alumnos inscritos (sin nuevas altas)</option>
              <option value="retain_teacher_only">Mantener solo acceso de profesorado</option>
              <option value="delete">Eliminar asignaturas finalizadas</option>
            </select>
          </label>
        </div>

        {settingsForm.periodMode === 'custom' && (
          <label className="space-y-2 block mt-4">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Etiqueta del periodo personalizado</span>
            <input
              type="text"
              placeholder="Ejemplo: Bimestre"
              value={settingsForm.customPeriodLabel}
              onChange={(e) => setField('customPeriodLabel', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        )}

        <div className="mt-5">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            Fechas predeterminadas por periodo
          </p>
          <div className="space-y-3">
            {buildCoursePeriodDefinitions({
              periodMode: settingsForm.periodMode,
              customPeriodLabel: settingsForm.customPeriodLabel,
            }).map((period: any) => {
              const currentPeriodDate = (settingsForm.periodDates || []).find((d: any) => Number(d.periodIndex) === period.periodIndex);
              const periodStartAt = currentPeriodDate?.periodStartAt || '';
              const periodEndAt = currentPeriodDate?.periodEndAt || '';
              return (
                <div key={period.periodIndex} className="grid grid-cols-[7rem_1fr_1fr] items-center gap-3">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{period.periodLabel}</span>
                  <label className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Inicio</span>
                    <input
                      type="date"
                      value={periodStartAt}
                      onChange={(e) => setPeriodDateField(period.periodIndex, 'periodStartAt', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Fin</span>
                    <input
                      type="date"
                      value={periodEndAt}
                      onChange={(e) => setPeriodDateField(period.periodIndex, 'periodEndAt', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Este calendario define la base institucional. Cada curso puede sobrescribir fechas de periodos y fin extraordinario sin modificar estos valores globales.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3 mb-5">
          <ArrowUpDown className="w-5 h-5 text-indigo-500 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Orden de cursos para promoción automática</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Define la jerarquía institucional de cursos (sin duplicados) para calcular el curso destino al promocionar.
            </p>
          </div>
        </div>

        <CoursePromotionOrderEditor
          coursePromotionOrder={settingsForm.coursePromotionOrder}
          onChange={(nextOrder: any) => setField('coursePromotionOrder', nextOrder)}
        />

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          El primer curso tiene la prioridad más alta. Al promocionar, cada curso avanza al curso inmediatamente superior en este orden.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3 mb-5">
          <ShieldCheck className="w-5 h-5 text-indigo-500 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Permisos docentes</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Estas opciones se movieron desde la pestaña Usuarios para centralizar la configuración institucional.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40">
            <input
              type="checkbox"
              checked={settingsForm.allowTeacherAutonomousSubjectCreation}
              onChange={(e) => setField('allowTeacherAutonomousSubjectCreation', e.target.checked)}
              className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Permitir crear asignaturas sin aprobación</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Si está desactivado, solo administradores podrán crear asignaturas nuevas.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40">
            <input
              type="checkbox"
              checked={settingsForm.canAssignClassesAndStudents}
              onChange={(e) => setField('canAssignClassesAndStudents', e.target.checked)}
              className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Permitir asignar clases y estudiantes</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Si está desactivado, las asignaciones directas deberán pasar por revisión administrativa.</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40">
            <input
              type="checkbox"
              checked={settingsForm.canDeleteSubjectsWithStudents}
              onChange={(e) => setField('canDeleteSubjectsWithStudents', e.target.checked)}
              className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Permitir eliminar asignaturas con alumnado vinculado</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Si está desactivado, no podrán eliminarse asignaturas con clases o alumnos asociados.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-3 mb-5">
          <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Automatizaciones institucionales</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Activa o desactiva herramientas globales para todo el equipo de la institución.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40">
            <input
              type="checkbox"
              checked={settingsForm.transferPromotionEnabled}
              onChange={(e) => setField('transferPromotionEnabled', e.target.checked)}
              className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Habilitar simulación y aplicación de traslados/promociones</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Controla el acceso a la herramienta de simulación en la pestaña de Cursos y Clases.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40">
            <input
              type="checkbox"
              checked={settingsForm.subjectLifecycleAutomationEnabled}
              onChange={(e) => setField('subjectLifecycleAutomationEnabled', e.target.checked)}
              className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Habilitar automatización de ciclo de vida de asignaturas</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Permite ejecuciones automáticas o manuales del motor de transición de estado académico.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="text-sm">
          {settingsMessage?.text ? (
            <p className={`font-medium flex items-center gap-2 ${settingsMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {settingsMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {settingsMessage.text}
            </p>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">Guarda para aplicar el calendario académico y los permisos docentes.</p>
          )}
        </div>

        <button
          onClick={onSave}
          disabled={saving || !canSave}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md transition-all disabled:opacity-70"
        >
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  );
};

export default SettingsTabContent;
