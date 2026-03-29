// src/pages/InstitutionAdminDashboard/modals/CreateClassModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Creates a new class.
//
// • Class name = "{CourseName} {identifier}" — e.g. "1º ESO A".
// • Course is required (must be created first).
// • academicYear is required (cohort / versioning pattern).
// • Teacher (single-select) and students (multi-select) use the same
//   PersonPicker component: search bar + scrollable checklist.

import React, { useMemo, useState } from 'react';
import { CalendarDays, Loader2, Save, XCircle } from 'lucide-react';
import {
  ghostBtnCls,
  InputField,
  inputCls,
  Modal,
  primaryBtnCls,
  SearchInput,
} from '../components/classes-courses/Shared.jsx';

// ─── Shared PersonPicker ──────────────────────────────────────────────────────
// Identical component to the one in ClassDetail, extracted here so both files
// stay self-contained without a shared import.
const PersonPicker = ({
  people,
  selectedIds,
  onToggle,
  singleSelect = false,
  placeholder  = 'Buscar…',
  emptyLabel   = 'No hay personas registradas.',
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

// ─── Academic year helper ─────────────────────────────────────────────────────
const currentAcademicYear = () => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed; academic year starts in September
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

// ─── Main modal ───────────────────────────────────────────────────────────────
const CreateClassModal = ({
  onClose,
  onSubmit,
  submitting,
  error,
  courses,
  allTeachers,
  allStudents,
}) => {
  const [courseId,     setCourseId]     = useState('');
  const [identifier,   setIdentifier]   = useState('');
  const [academicYear, setAcademicYear] = useState(currentAcademicYear());
  const [teacherIds,   setTeacherIds]   = useState([]);   // 0 or 1 element
  const [studentIds,   setStudentIds]   = useState([]);

  const selectedCourse = courses.find(c => c.id === courseId);
  const fullName = selectedCourse
    ? `${selectedCourse.name}${identifier.trim() ? ' ' + identifier.trim() : ''}`
    : identifier.trim();

  const handleTeacherToggle = (id) => {
    if (id === null || teacherIds[0] === id) {
      setTeacherIds([]);
    } else {
      setTeacherIds([id]);
    }
  };

  const handleStudentToggle = (id) => {
    setStudentIds(p =>
      p.includes(id) ? p.filter(s => s !== id) : [...p, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name:         fullName,
      courseId,
      teacherId:    teacherIds[0] ?? '',
      studentIds,
      academicYear,
      status:       'active',
    });
  };

  const isValid = !!courseId && identifier.trim().length > 0 && academicYear.trim().length > 0;

  return (
    <Modal title="Nueva Clase" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Course (required) ── */}
        <InputField label="Curso" required hint="(debe existir previamente)">
          <select
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
            className={inputCls}
            required
          >
            <option value="">— Selecciona un curso —</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {courses.length === 0 && (
            <p className="text-xs text-amber-500 mt-1.5">
              ⚠ No hay cursos disponibles. Crea un curso primero.
            </p>
          )}
        </InputField>

        {/* ── Identifier (required) ── */}
        <InputField label="Identificador del grupo" required hint="Ej: A, B, Mañana…">
          <input
            type="text"
            placeholder="A"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className={inputCls}
          />
        </InputField>

        {/* ── Academic year (required) ── */}
        <InputField label="Año académico" required>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="2024-2025"
              value={academicYear}
              onChange={e => setAcademicYear(e.target.value)}
              className={`${inputCls} pl-8`}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Clases de distintos años coexisten. Los alumnos conservan acceso histórico a sus asignaturas al archivar el año.
          </p>
        </InputField>

        {/* ── Name preview ── */}
        {fullName ? (
          <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 mb-0.5">Nombre completo de la clase</p>
            <p className="text-base font-bold text-slate-800 dark:text-white">
              {fullName}
              {academicYear.trim() && (
                <span className="ml-2 text-xs font-normal text-slate-400">({academicYear})</span>
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

        {/* ── Teacher — single-select PersonPicker ── */}
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

        {/* ── Students — multi-select PersonPicker (same visual style) ── */}
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