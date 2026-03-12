// src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Detailed view for a single class.
// Every field (name identifier, course, teacher, students) is editable
// individually via the pencil → inline form → save/cancel pattern.
// Teacher and student fields include search bars.

import React, { useMemo, useState } from 'react';
import { BookOpen, User, Users } from 'lucide-react';
import {
  DetailHeader,
  InlineEditField,
  inputCls,
  SearchInput,
  SectionCard,
  StatCard,
} from './Shared.jsx';

// ─── Student roster (read) ────────────────────────────────────────────────────
const StudentRoster = ({ studentIds, allStudents, color }) => {
  const enrolled = allStudents.filter(s => (studentIds || []).includes(s.id));
  if (enrolled.length === 0) {
    return (
      <p className="text-sm text-slate-400 dark:text-slate-500 italic py-3 text-center">
        Sin alumnos inscritos.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {enrolled.map(s => (
        <div
          key={s.id}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: color }}
          >
            {(s.displayName || s.email || '?')[0].toUpperCase()}
          </div>
          <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
            {s.displayName || s.email}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Inline teacher picker ────────────────────────────────────────────────────
const TeacherPicker = ({ value, onChange, allTeachers }) => {
  const [q, setQ] = useState('');
  const filtered = useMemo(
    () => allTeachers.filter(t =>
      (t.displayName || t.email || '').toLowerCase().includes(q.toLowerCase())
    ),
    [allTeachers, q]
  );
  return (
    <div className="space-y-2">
      <SearchInput value={q} onChange={setQ} placeholder="Buscar profesor…" />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputCls}
        size={Math.min(filtered.length + 1, 5)}
      >
        <option value="">Sin asignar</option>
        {filtered.map(t => (
          <option key={t.id} value={t.id}>{t.displayName || t.email}</option>
        ))}
      </select>
    </div>
  );
};

// ─── Inline student checklist ─────────────────────────────────────────────────
const StudentPicker = ({ value, onChange, allStudents }) => {
  const [q, setQ] = useState('');
  const filtered = useMemo(
    () => allStudents.filter(s =>
      (s.displayName || s.email || '').toLowerCase().includes(q.toLowerCase())
    ),
    [allStudents, q]
  );
  const toggle = (id) =>
    onChange(value.includes(id) ? value.filter(s => s !== id) : [...value, id]);

  return (
    <div className="space-y-2">
      <SearchInput value={q} onChange={setQ} placeholder="Buscar alumno…" />
      <div className="max-h-52 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-700">
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
              checked={value.includes(s.id)}
              onChange={() => toggle(s.id)}
              className="rounded accent-indigo-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
              {s.displayName || s.email}
            </span>
          </label>
        ))}
      </div>
      <p className="text-xs text-slate-400">{value.length} alumno(s) seleccionado(s)</p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ClassDetail = ({
  cls,
  courses,
  allTeachers,
  allStudents,
  onBack,
  onDelete,
  onUpdateField, // (id, patch) => Promise
}) => {
  const [editingKey, setEditingKey] = useState(null);
  const [draft,      setDraft]      = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');

  const course  = courses.find(c => c.id === cls.courseId);
  const teacher = allTeachers.find(t => t.id === cls.teacherId);
  const color   = course?.color || '#6366f1';

  // The identifier is the part after the course name
  // e.g. cls.name = "1º ESO A", course.name = "1º ESO" → identifier = "A"
  const getIdentifier = () => {
    if (!course) return cls.name;
    const prefix = course.name + ' ';
    return cls.name.startsWith(prefix) ? cls.name.slice(prefix.length) : cls.name;
  };

  const startEdit = (key) => {
    setSaveError('');
    if (key === 'identifier') {
      setDraft({ courseId: cls.courseId, identifier: getIdentifier() });
    } else if (key === 'teacher') {
      setDraft({ teacherId: cls.teacherId || '' });
    } else if (key === 'students') {
      setDraft({ studentIds: cls.studentIds ? [...cls.studentIds] : [] });
    }
    setEditingKey(key);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setDraft({});
    setSaveError('');
  };

  const saveField = async (key) => {
    setSaving(true);
    setSaveError('');
    try {
      let patch = {};

      if (key === 'identifier') {
        const selectedCourse = courses.find(c => c.id === draft.courseId);
        if (!draft.courseId) { setSaveError('Debes seleccionar un curso.'); setSaving(false); return; }
        if (!String(draft.identifier || '').trim()) { setSaveError('El identificador no puede estar vacío.'); setSaving(false); return; }
        const newName = `${selectedCourse.name} ${draft.identifier.trim()}`;
        patch = { name: newName, courseId: draft.courseId };
      } else if (key === 'teacher') {
        patch = { teacherId: draft.teacherId };
      } else if (key === 'students') {
        patch = { studentIds: draft.studentIds };
      }

      await onUpdateField(cls.id, patch);
      setEditingKey(null);
      setDraft({});
    } catch {
      setSaveError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
      <DetailHeader
        onBack={onBack}
        color={color}
        title={cls.name}
        badge={`Clase · ${course ? course.name : 'Sin curso asignado'}`}
        onEdit={() => startEdit('identifier')}
        onDelete={onDelete}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Users}   label="Alumnos inscritos" value={(cls.studentIds || []).length} color={color} />
        <StatCard icon={BookOpen} label="Curso"            value={course?.name || '—'}            color={color} />
      </div>

      {saveError && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">
          {saveError}
        </p>
      )}

      {/* Per-field panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-1">

        {/* Name / identifier */}
        <InlineEditField
          label="Nombre de la clase"
          displayValue={cls.name}
          editingKey={editingKey}
          fieldKey="identifier"
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveField}
          saving={saving}
        >
          <div className="space-y-3">
            {/* Course selector */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Curso <span className="text-red-400">*</span></p>
              <select
                value={draft.courseId ?? ''}
                onChange={e => setDraft(p => ({ ...p, courseId: e.target.value }))}
                className={inputCls}
                required
              >
                <option value="">— Selecciona un curso —</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {/* Identifier */}
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Identificador <span className="text-red-400">*</span></p>
              <input
                type="text"
                value={draft.identifier ?? ''}
                onChange={e => setDraft(p => ({ ...p, identifier: e.target.value }))}
                placeholder="A"
                className={inputCls}
              />
            </div>
            {/* Live preview */}
            {(draft.courseId || draft.identifier) && (
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400">Vista previa</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">
                  {courses.find(c => c.id === draft.courseId)?.name ?? ''}
                  {draft.identifier?.trim() ? ` ${draft.identifier.trim()}` : ''}
                </p>
              </div>
            )}
          </div>
        </InlineEditField>

        {/* Teacher */}
        <InlineEditField
          label="Profesor responsable"
          displayValue={teacher ? (teacher.displayName || teacher.email) : null}
          editingKey={editingKey}
          fieldKey="teacher"
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveField}
          saving={saving}
        >
          <TeacherPicker
            value={draft.teacherId ?? ''}
            onChange={v => setDraft(p => ({ ...p, teacherId: v }))}
            allTeachers={allTeachers}
          />
        </InlineEditField>

        {/* Students */}
        <InlineEditField
          label={`Alumnos (${(cls.studentIds || []).length})`}
          displayValue={
            (cls.studentIds || []).length > 0
              ? `${(cls.studentIds || []).length} alumno(s) inscritos`
              : null
          }
          editingKey={editingKey}
          fieldKey="students"
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveField}
          saving={saving}
        >
          <StudentPicker
            value={draft.studentIds ?? []}
            onChange={v => setDraft(p => ({ ...p, studentIds: v }))}
            allStudents={allStudents}
          />
        </InlineEditField>
      </div>

      {/* Student roster card */}
      <SectionCard
        title={`Alumnos (${(cls.studentIds || []).length})`}
        icon={Users}
        color={color}
      >
        <StudentRoster
          studentIds={cls.studentIds || []}
          allStudents={allStudents}
          color={color}
        />
      </SectionCard>

      {/* Teacher card */}
      <SectionCard title="Profesor responsable" icon={User} color={color}>
        {teacher ? (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: color }}
            >
              {(teacher.displayName || teacher.email || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                {teacher.displayName || teacher.email}
              </p>
              {teacher.displayName && (
                <p className="text-xs text-slate-400">{teacher.email}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Sin profesor asignado.</p>
        )}
      </SectionCard>
    </div>
  );
};

export default ClassDetail;