// src/pages/InstitutionAdminDashboard/modals/CreateClassModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Creates a new class.
//
// • Class name = "{CourseName} {identifier}" — e.g. "1º ESO A".
// • Course is required (must be created first).
// • academicYear is derived from the selected course.
// • Teacher (single-select) and students (multi-select) use the same
//   PersonPicker component: search bar + scrollable checklist.

import React, { useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Loader2, Save, XCircle } from 'lucide-react';
import {
  ghostBtnCls,
  InputField,
  inputCls,
  Modal,
  primaryBtnCls,
  SearchInput,
} from '../components/classes-courses/Shared';
import {
  getDefaultAcademicYear,
  normalizeAcademicYear,
} from '../components/classes-courses/academicYearUtils';

const PersonPicker = ({
  people,
  selectedIds,
  onToggle,
  singleSelect = false,
  placeholder = 'Buscar…',
  emptyLabel = 'No hay personas registradas.',
}) => {
  const [q, setQ] = useState('');

  const filtered = useMemo(
    () => people.filter(p =>
      (p.displayName || p.email || '').toLowerCase().includes(q.toLowerCase())
    ),
    [people, q]
  );

  return (
    <div className="space-y-2">
      <SearchInput value={q} onChange={setQ} placeholder={placeholder} />

      <div className="max-h-44 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-700">
        {singleSelect && (
          <label className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <input
              type="radio"
              checked={selectedIds.length === 0}
              onChange={() => onToggle(null)}
              className="accent-indigo-600"
            />
            <span className="text-sm text-slate-500 dark:text-slate-400 italic">Sin asignar</span>
          </label>
        )}

        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            {people.length === 0 ? emptyLabel : 'Sin resultados.'}
          </p>
        ) : filtered.map(p => (
          <label
            key={p.id}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <input
              type={singleSelect ? 'radio' : 'checkbox'}
              checked={selectedIds.includes(p.id)}
              onChange={() => onToggle(p.id)}
              className="accent-indigo-600"
            />
            <div className="min-w-0">
              <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                {p.displayName || p.email}
              </p>
              {p.displayName && (
                <p className="text-xs text-slate-400 truncate">{p.email}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {!singleSelect && (
        <p className="text-xs text-slate-400">{selectedIds.length} alumno(s) seleccionado(s)</p>
      )}
    </div>
  );
};

const CreateClassModal = ({
  onClose,
  onSubmit,
  submitting,
  error,
  courses,
  allTeachers,
  allStudents,
}: any) => {
  const [courseId, setCourseId] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [teacherIds, setTeacherIds] = useState<any[]>([]);
  const [studentIds, setStudentIds] = useState<any[]>([]);

  const selectedCourse = courses.find(c => c.id === courseId);
  const selectedCourseAcademicYear = normalizeAcademicYear(selectedCourse?.academicYear);
  const fallbackAcademicYear = getDefaultAcademicYear();
  const derivedAcademicYear = selectedCourseAcademicYear || fallbackAcademicYear;
  const usingFallbackAcademicYear = Boolean(courseId) && !selectedCourseAcademicYear;

  const fullName = selectedCourse
    ? `${selectedCourse.name}${identifier.trim() ? ' ' + identifier.trim() : ''}`
    : identifier.trim();

  const handleTeacherToggle = (id: any) => {
    if (id === null || teacherIds[0] === id) {
      setTeacherIds([]);
    } else {
      setTeacherIds([id]);
    }
  };

  const handleStudentToggle = (id: any) => {
    setStudentIds((previous) =>
      previous.includes(id) ? previous.filter((studentId) => studentId !== id) : [...previous, id]
    );
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      name: fullName,
      courseId,
      teacherId: teacherIds[0] ?? '',
      studentIds,
      academicYear: derivedAcademicYear,
      status: 'active',
    });
  };

  const isValid = Boolean(courseId) && identifier.trim().length > 0;

  return (
    <Modal title="Nueva Clase" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField label="Curso" required hint="(debe existir previamente)">
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className={inputCls}
            required
          >
            <option value="">— Selecciona un curso —</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
          {courses.length === 0 && (
            <p className="text-xs text-amber-500 mt-1.5 inline-flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              No hay cursos disponibles. Crea un curso primero.
            </p>
          )}
        </InputField>

        <InputField label="Identificador del grupo" required hint="Ej: A, B, Mañana…">
          <input
            type="text"
            placeholder="A"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={inputCls}
          />
        </InputField>

        <InputField label="Año académico" required hint="(heredado del curso)">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={courseId ? derivedAcademicYear : ''}
              className={`${inputCls} pl-8`}
              placeholder="Selecciona un curso"
              readOnly
            />
          </div>
          <p className="mt-1 text-xs text-slate-400">
            La clase usa automáticamente el año académico del curso seleccionado.
          </p>
          {usingFallbackAcademicYear && (
            <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-300">
              El curso no tenía año académico válido. Se usará {fallbackAcademicYear} para mantener consistencia.
            </p>
          )}
        </InputField>

        {fullName ? (
          <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 mb-0.5">Nombre completo de la clase</p>
            <p className="text-base font-bold text-slate-800 dark:text-white">
              {fullName}
              {derivedAcademicYear && (
                <span className="ml-2 text-xs font-normal text-slate-400">({derivedAcademicYear})</span>
              )}
            </p>
          </div>
        ) : (
          <div className="px-4 py-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 italic text-center">
              Selecciona curso e identificador para ver el nombre completo
            </p>
          </div>
        )}

        <InputField label="Profesor responsable" hint="(opcional)">
          <PersonPicker
            people={allTeachers}
            selectedIds={teacherIds}
            onToggle={handleTeacherToggle}
            singleSelect
            placeholder="Buscar profesor…"
            emptyLabel="No hay profesores registrados."
          />
        </InputField>

        <InputField
          label="Alumnos"
          hint={studentIds.length > 0 ? `${studentIds.length} seleccionado(s)` : '(opcional)'}
        >
          <PersonPicker
            people={allStudents}
            selectedIds={studentIds}
            onToggle={handleStudentToggle}
            placeholder="Buscar alumno…"
            emptyLabel="No hay alumnos registrados."
          />
        </InputField>

        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <XCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={ghostBtnCls}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting || !isValid} className={primaryBtnCls}>
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Save className="w-4 h-4" /> Crear clase</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClassModal;