// src/pages/InstitutionAdminDashboard/components/classes-courses/ClassDetail.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Detailed view for a single class.
// • Every field editable individually via pencil → inline form → save/cancel.
// • Teacher AND students use the identical PersonPicker component:
//     search bar + scrollable checklist (radio for teacher, checkbox for students).
// • academicYear field added (cohort / academic-year versioning pattern).

import React, { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, User, Users } from 'lucide-react';
import {
  DetailHeader,
  InlineEditField,
  inputCls,
  SearchInput,
  SectionCard,
  StatCard,
} from './Shared';

// ─── PersonPicker ─────────────────────────────────────────────────────────────
// One component for both teacher (singleSelect=true) and students (singleSelect=false).
// selectedIds is always an array; caller decides the max cardinality.
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

      <div className="max-h-52 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-700">
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

// ─── Read-only student roster ─────────────────────────────────────────────────
const StudentRoster = ({ studentIds, allStudents, color }: any) => {
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

// ─── Main component ───────────────────────────────────────────────────────────
const ClassDetail = ({
  cls,
  courses,
  allTeachers,
  allStudents,
  onBack,
  onDelete,
  onUpdateField, // (id, patch) => Promise
  initialEditKey,
}) => {
  const [editingKey, setEditingKey] = useState<any>(null);
  const [draft,      setDraft]      = useState<any>({});
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');

  const course  = courses.find(c => c.id === cls.courseId);
  const teacher = allTeachers.find(t => t.id === cls.teacherId);
  const color   = course?.color || '#6366f1';

  const getIdentifier = () => {
    if (!course) return cls.name;
    const prefix = course.name + ' ';
    return cls.name.startsWith(prefix) ? cls.name.slice(prefix.length) : cls.name;
  };

  const startEdit = (key: any) => {
    setSaveError('');
    if (key === 'identifier') {
      setDraft({ courseId: cls.courseId, identifier: getIdentifier() });
    } else if (key === 'teacher') {
      setDraft({ teacherIds: cls.teacherId ? [cls.teacherId] : [] });
    } else if (key === 'students') {
      setDraft({ studentIds: cls.studentIds ? [...cls.studentIds] : [] });
    } else if (key === 'academicYear') {
      setDraft({ academicYear: cls.academicYear || '' });
    }
    setEditingKey(key);
  };

  const cancelEdit = () => { setEditingKey(null); setDraft({}); setSaveError(''); };

  const saveField = async (key: any) => {
    setSaving(true);
    setSaveError('');
    try {
      let patch = {};
      if (key === 'identifier') {
        const sel = courses.find(c => c.id === draft.courseId);
        if (!draft.courseId)                        { setSaveError('Debes seleccionar un curso.'); setSaving(false); return; }
        if (!String(draft.identifier || '').trim()) { setSaveError('El identificador no puede estar vacío.'); setSaving(false); return; }
        patch = { name: `${sel.name} ${draft.identifier.trim()}`, courseId: draft.courseId };
      } else if (key === 'teacher') {
        patch = { teacherId: draft.teacherIds?.[0] ?? '' };
      } else if (key === 'students') {
        patch = { studentIds: draft.studentIds };
      } else if (key === 'academicYear') {
        patch = { academicYear: draft.academicYear };
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

  // Radio toggle for teacher: clicking the already-selected one deselects it
  const handleTeacherToggle = (id: any) => {
    if (id === null || draft.teacherIds?.[0] === id) {
      setDraft(p => ({ ...p, teacherIds: [] }));
    } else {
      setDraft(p => ({ ...p, teacherIds: [id] }));
    }
  };

  const handleStudentToggle = (id: any) => {
    setDraft(p => ({
      ...p,
      studentIds: (p.studentIds || []).includes(id)
        ? p.studentIds.filter(s => s !== id)
        : [...(p.studentIds || []), id],
    }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
      <DetailHeader
        onBack={onBack}
        color={color}
        title={cls.name}
        badge={`Clase · ${course ? course.name : 'Sin curso asignado'}${cls.academicYear ? ` · ${cls.academicYear}` : ''}`}
        onEdit={() => startEdit('identifier')}
        onDelete={onDelete}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Users}        label="Alumnos inscritos" value={(cls.studentIds || []).length} color={color} />
        <StatCard icon={BookOpen}     label="Curso"             value={course?.name || '—'}           color={color} />
        <StatCard icon={CalendarDays} label="Año académico"     value={cls.academicYear || '—'}       color={color} />
      </div>

      {saveError && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">
          {saveError}
        </p>
      )}

      {/* ── Per-field edit panel ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-1">

        {/* Nombre de la clase */}
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
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Curso <span className="text-red-400">*</span></p>
              <select
                value={draft.courseId ?? ''}
                onChange={e => setDraft(p => ({ ...p, courseId: e.target.value }))}
                className={inputCls}
                required
              >
                <option value="">— Selecciona un curso —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
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

        {/* Año académico */}
        <InlineEditField
          label="Año académico"
          displayValue={
            cls.academicYear
              ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                  {cls.academicYear}
                  {cls.status === 'archived' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded font-medium">
                      Archivada
                    </span>
                  )}
                </span>
              )
              : null
          }
          editingKey={editingKey}
          fieldKey="academicYear"
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveField}
          saving={saving}
        >
          <input
            type="text"
            value={draft.academicYear ?? ''}
            onChange={e => setDraft(p => ({ ...p, academicYear: e.target.value }))}
            placeholder="2024-2025"
            className={inputCls}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Clases de distintos años coexisten sin conflicto. Al archivar un año los alumnos mantienen acceso histórico a sus asignaturas.
          </p>
        </InlineEditField>

        {/* Profesor — single-select PersonPicker */}
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
          <PersonPicker
            people={allTeachers}
            selectedIds={draft.teacherIds ?? []}
            onToggle={handleTeacherToggle}
            singleSelect
            placeholder="Buscar profesor…"
            emptyLabel="No hay profesores registrados."
          />
        </InlineEditField>

        {/* Alumnos — multi-select PersonPicker (same look as above) */}
        <InlineEditField
          label={`Alumnos (${(cls.studentIds || []).length})`}
          displayValue={
            (cls.studentIds || []).length > 0
              ? `${cls.studentIds.length} alumno(s) inscritos`
              : null
          }
          editingKey={editingKey}
          fieldKey="students"
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveField}
          saving={saving}
        >
          <PersonPicker
            people={allStudents}
            selectedIds={draft.studentIds ?? []}
            onToggle={handleStudentToggle}
            placeholder="Buscar alumno…"
            emptyLabel="No hay alumnos registrados."
          />
        </InlineEditField>
      </div>

      {/* Read-only summary cards */}
      <SectionCard title={`Alumnos (${(cls.studentIds || []).length})`} icon={Users} color={color}>
        <StudentRoster studentIds={cls.studentIds || []} allStudents={allStudents} color={color} />
      </SectionCard>

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