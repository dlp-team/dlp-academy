// src/pages/InstitutionAdminDashboard/modals/CreateClassModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal for creating a new class.
//
// Class name is a *composition*: "{CourseName} {identifier}"
//   e.g. course = "1º ESO", identifier = "A"  →  full name = "1º ESO A"
//
// • Course is required and must be chosen from the existing list.
// • Teacher and students are optional, both have search bars.

import React, { useMemo, useState } from 'react';
import { Loader2, Save, XCircle } from 'lucide-react';
import {
  ghostBtnCls,
  InputField,
  inputCls,
  Modal,
  primaryBtnCls,
  SearchInput,
} from '../components/classes-courses/Shared.jsx';

// ─── SearchableStudentList ────────────────────────────────────────────────────
const SearchableStudentList = ({ allStudents, selectedIds, onToggle }) => {
  const [q, setQ] = useState('');
  const filtered = useMemo(
    () => allStudents.filter(s =>
      (s.displayName || s.email || '').toLowerCase().includes(q.toLowerCase())
    ),
    [allStudents, q]
  );

  return (
    <div className="space-y-2">
      <SearchInput value={q} onChange={setQ} placeholder="Buscar alumno…" />
      <div className="max-h-44 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-700">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            {allStudents.length === 0 ? 'No hay alumnos registrados.' : 'Sin resultados.'}
          </p>
        ) : filtered.map(s => (
          <label
            key={s.id}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(s.id)}
              onChange={() => onToggle(s.id)}
              className="rounded text-indigo-600 accent-indigo-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
              {s.displayName || s.email}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
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
  const [courseId,    setCourseId]    = useState('');
  const [identifier,  setIdentifier]  = useState('');
  const [teacherId,   setTeacherId]   = useState('');
  const [studentIds,  setStudentIds]  = useState([]);
  const [teacherQ,    setTeacherQ]    = useState('');

  const selectedCourse = courses.find(c => c.id === courseId);

  // The full class name shown as a live preview
  const fullName = selectedCourse
    ? `${selectedCourse.name}${identifier.trim() ? ' ' + identifier.trim() : ''}`
    : identifier.trim() || '';

  const toggleStudent = (id) =>
    setStudentIds(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const filteredTeachers = useMemo(
    () => allTeachers.filter(t =>
      (t.displayName || t.email || '').toLowerCase().includes(teacherQ.toLowerCase())
    ),
    [allTeachers, teacherQ]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: fullName, courseId, teacherId, studentIds });
  };

  return (
    <Modal title="Nueva Clase" onClose={onClose} wide>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Course selector (required) ── */}
        <InputField label="Curso" required hint="(debe crearse antes)">
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
            <p className="text-xs text-amber-500 mt-1">
              No hay cursos disponibles. Crea un curso primero.
            </p>
          )}
        </InputField>

        {/* ── Identifier / group ── */}
        <InputField label="Identificador del grupo" required hint="Ej: A, B, Tarde…">
          <input
            type="text"
            placeholder="A"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className={inputCls}
            required
          />
        </InputField>

        {/* ── Name preview ── */}
        {(selectedCourse || identifier.trim()) && (
          <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 mb-0.5">Nombre completo de la clase</p>
            <p className="text-base font-bold text-slate-800 dark:text-white">
              {fullName || <span className="text-slate-400 font-normal italic">—</span>}
            </p>
          </div>
        )}

        {/* ── Teacher ── */}
        <InputField label="Profesor responsable">
          <div className="space-y-2">
            <SearchInput value={teacherQ} onChange={setTeacherQ} placeholder="Buscar profesor…" />
            <select
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
              className={inputCls}
              size={Math.min(filteredTeachers.length + 1, 5)}
            >
              <option value="">Sin asignar</option>
              {filteredTeachers.map(t => (
                <option key={t.id} value={t.id}>{t.displayName || t.email}</option>
              ))}
            </select>
          </div>
        </InputField>

        {/* ── Students ── */}
        <InputField
          label="Alumnos"
          hint={studentIds.length > 0 ? `${studentIds.length} seleccionado(s)` : undefined}
        >
          <SearchableStudentList
            allStudents={allStudents}
            selectedIds={studentIds}
            onToggle={toggleStudent}
          />
        </InputField>

        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <XCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={ghostBtnCls}>Cancelar</button>
          <button
            type="submit"
            disabled={submitting || !courseId || !identifier.trim()}
            className={primaryBtnCls}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Crear clase</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClassModal;