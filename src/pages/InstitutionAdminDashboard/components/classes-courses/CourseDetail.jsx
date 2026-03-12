// src/pages/InstitutionAdminDashboard/components/classes-courses/CourseDetail.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Detailed view for a single course.
// Each field has its own inline Edit pencil → save/cancel flow.

import React, { useState } from 'react';
import { BookOpen, LayoutGrid, Loader2, User, Users } from 'lucide-react';
import {
  AvatarChip,
  ColorPicker,
  DetailHeader,
  InlineEditField,
  inputCls,
  SectionCard,
  StatCard,
} from './Shared.jsx';

// ─── Classes mini-list ────────────────────────────────────────────────────────
const CourseClassesList = ({ courseClasses, allTeachers, color }) => {
  if (courseClasses.length === 0) {
    return (
      <p className="text-sm text-slate-400 italic text-center py-4">
        Ninguna clase asignada a este curso.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {courseClasses.map(cl => {
        const teacher = allTeachers.find(t => t.id === cl.teacherId);
        return (
          <div
            key={cl.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl
              bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">
                {cl.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {teacher ? (teacher.displayName || teacher.email) : 'Sin profesor'}
              </p>
            </div>
            <AvatarChip
              label={`${(cl.studentIds || []).length} alumnos`}
              color={color}
            />
          </div>
        );
      })}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const CourseDetail = ({
  course,
  classes,        // all institution classes (to filter by courseId)
  allTeachers,
  onBack,
  onDelete,
  onUpdateField,  // (id, patch) => Promise
}) => {
  const [editingKey, setEditingKey] = useState(null); // which field is open
  const [draft,      setDraft]      = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');

  const color         = course.color || '#6366f1';
  const courseClasses = classes.filter(cl => cl.courseId === course.id);
  const totalStudents = new Set(courseClasses.flatMap(cl => cl.studentIds || [])).size;
  const totalTeachers = new Set(courseClasses.map(cl => cl.teacherId).filter(Boolean)).size;

  const startEdit = (key) => {
    setSaveError('');
    setDraft({ [key]: course[key] ?? '' });
    setEditingKey(key);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setDraft({});
    setSaveError('');
  };

  const saveField = async (key) => {
    const value = draft[key];
    if (key === 'name' && !String(value || '').trim()) {
      setSaveError('El nombre no puede estar vacío.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await onUpdateField(course.id, { [key]: value });
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
        title={course.name}
        badge={`Curso · ${courseClasses.length} clase${courseClasses.length !== 1 ? 's' : ''}`}
        onEdit={() => startEdit('name')}
        onDelete={onDelete}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={LayoutGrid} label="Clases"          value={courseClasses.length} color={color} />
        <StatCard icon={Users}      label="Alumnos únicos"  value={totalStudents}        color={color} />
        <StatCard icon={User}       label="Profesores"      value={totalTeachers}        color={color} />
      </div>

      {saveError && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">
          {saveError}
        </p>
      )}

      {/* Per-field edit card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-1">

        {/* Name */}
        <InlineEditField
          label="Nombre del curso"
          displayValue={course.name}
          editingKey={editingKey}
          fieldKey="name"
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveField}
          saving={saving}
        >
          <input
            type="text"
            value={draft.name ?? ''}
            onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
            className={inputCls}
            autoFocus
            placeholder="Nombre del curso"
          />
        </InlineEditField>

        {/* Description */}
        <InlineEditField
          label="Descripción"
          displayValue={course.description}
          editingKey={editingKey}
          fieldKey="description"
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveField}
          saving={saving}
        >
          <textarea
            value={draft.description ?? ''}
            onChange={e => setDraft(p => ({ ...p, description: e.target.value }))}
            className={`${inputCls} resize-none`}
            rows={3}
            placeholder="Descripción opcional…"
          />
        </InlineEditField>

        {/* Color */}
        <InlineEditField
          label="Color de identificación"
          displayValue={
            <span
              className="inline-flex items-center gap-2"
            >
              <span
                className="w-4 h-4 rounded-full inline-block border border-black/10"
                style={{ backgroundColor: course.color || '#6366f1' }}
              />
              {course.color || '#6366f1'}
            </span>
          }
          editingKey={editingKey}
          fieldKey="color"
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveField}
          saving={saving}
        >
          <ColorPicker
            value={draft.color ?? course.color ?? '#6366f1'}
            onChange={c => setDraft(p => ({ ...p, color: c }))}
          />
        </InlineEditField>
      </div>

      {/* Classes list */}
      <SectionCard title="Clases de este curso" icon={LayoutGrid} color={color}>
        <CourseClassesList
          courseClasses={courseClasses}
          allTeachers={allTeachers}
          color={color}
        />
      </SectionCard>
    </div>
  );
};

export default CourseDetail;