// src/pages/InstitutionAdminDashboard/components/classes-courses/CourseDetail.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Detailed view for a single course.
// • Per-field inline editing via pencil → form → save/cancel.
// • The "name" field is split into courseNumber (integer) + courseName (text),
//   mirroring the CreateCourseModal. Combined name stored as `name` on save.

import React, { useState } from 'react';
import { CalendarDays, Hash, LayoutGrid, Type, User, Users } from 'lucide-react';
import {
  AvatarChip,
  ColorPicker,
  DetailHeader,
  InlineEditField,
  inputCls,
  SectionCard,
  StatCard,
} from './Shared';
import AcademicYearPicker from './AcademicYearPicker';
import {
  getDefaultAcademicYear,
  isValidAcademicYear,
  normalizeAcademicYear,
} from './academicYearUtils';

// ─── Classes mini-list inside course detail ───────────────────────────────────
const CourseClassesList = ({ courseClasses, allTeachers, color }: any) => {
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
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
          >
            <div className="min-w-0">
              <p className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">
                {cl.name}
              </p>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
                {cl.academicYear && (
                  <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded text-[10px] font-medium">
                    {cl.academicYear}
                  </span>
                )}
                {teacher ? (teacher.displayName || teacher.email) : 'Sin profesor'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {cl.status === 'archived' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-400 font-medium">
                  Archivada
                </span>
              )}
              <AvatarChip label={`${(cl.studentIds || []).length} alumnos`} color={color} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const CourseDetail = ({
  course,
  classes,
  allTeachers,
  onBack,
  onDelete,
  onUpdateField, // (id, patch) => Promise
}) => {
  const [editingKey, setEditingKey] = useState<any>(null);
  const [draft,      setDraft]      = useState<any>({});
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');

  const color         = course.color || '#6366f1';
  const resolvedAcademicYear = normalizeAcademicYear(course.academicYear) || getDefaultAcademicYear();
  const courseClasses = classes.filter(cl => cl.courseId === course.id);
  const totalStudents = new Set(courseClasses.flatMap(cl => cl.studentIds || [])).size;
  const totalTeachers = new Set(courseClasses.map(cl => cl.teacherId).filter(Boolean)).size;

  const startEdit = (key: any) => {
    setSaveError('');
    if (key === 'name') {
      // Populate draft with the stored split fields (or fall back to '' if missing)
      setDraft({
        courseNumber: course.courseNumber != null ? String(course.courseNumber) : '',
        courseName:   course.courseName   ?? course.name ?? '',
      });
    } else if (key === 'academicYear') {
      setDraft({ academicYear: resolvedAcademicYear });
    } else {
      setDraft({ [key]: course[key] ?? '' });
    }
    setEditingKey(key);
  };

  const cancelEdit = () => { setEditingKey(null); setDraft({}); setSaveError(''); };

  const saveField = async (key: any) => {
    setSaving(true);
    setSaveError('');
    try {
      let patch = {};
      if (key === 'name') {
        const num   = parseInt(draft.courseNumber, 10);
        const cname = (draft.courseName || '').trim();
        if (!cname) { setSaveError('El nombre no puede estar vacío.'); setSaving(false); return; }
        const numStr = Number.isInteger(num) && num > 0 ? `${num}º` : '';
        patch = {
          courseNumber: Number.isInteger(num) && num > 0 ? num : null,
          courseName:   cname,
          name:         [numStr, cname].filter(Boolean).join(' '),
        };
      } else if (key === 'academicYear') {
        const nextAcademicYear = normalizeAcademicYear(draft.academicYear);
        if (!isValidAcademicYear(nextAcademicYear)) {
          setSaveError('El año académico debe tener formato YYYY-YYYY y años consecutivos.');
          setSaving(false);
          return;
        }
        patch = { academicYear: nextAcademicYear };
      } else {
        patch = { [key]: draft[key] };
      }
      await onUpdateField(course.id, patch);
      setEditingKey(null);
      setDraft({});
    } catch {
      setSaveError('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // Live preview while editing the name
  const previewNum  = parseInt(draft.courseNumber, 10);
  const previewName = [
    Number.isInteger(previewNum) && previewNum > 0 ? `${previewNum}º` : '',
    (draft.courseName || '').trim(),
  ].filter(Boolean).join(' ');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-5">
      <DetailHeader
        onBack={onBack}
        color={color}
        title={course.name}
        badge={`Curso · ${resolvedAcademicYear} · ${courseClasses.length} clase${courseClasses.length !== 1 ? 's' : ''}`}
        onEdit={() => startEdit('name')}
        onDelete={onDelete}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={LayoutGrid} label="Clases"         value={courseClasses.length} color={color} />
        <StatCard icon={CalendarDays} label="Año académico" value={resolvedAcademicYear} color={color} />
        <StatCard icon={Users}      label="Alumnos únicos" value={totalStudents}        color={color} />
        <StatCard icon={User}       label="Profesores"     value={totalTeachers}        color={color} />
      </div>

      {saveError && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">
          {saveError}
        </p>
      )}

      {/* ── Per-field panel ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-5 py-1">

        {/* Name — split into number + text */}
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
          <div className="space-y-3">
            <div className="flex gap-3 items-end">
              {/* Number */}
              <div className="w-28 shrink-0">
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Número
                </p>
                <input
                  type="number"
                  min="1"
                  max="99"
                  step="1"
                  placeholder="1"
                  value={draft.courseNumber ?? ''}
                  onChange={e => setDraft(p => ({ ...p, courseNumber: e.target.value }))}
                  className={inputCls}
                  autoFocus
                />
              </div>
              {/* Text */}
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <Type className="w-3 h-3" /> Nombre
                </p>
                <input
                  type="text"
                  placeholder="ESO, Bachillerato…"
                  value={draft.courseName ?? ''}
                  onChange={e => setDraft(p => ({ ...p, courseName: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
            {/* Preview */}
            {previewName && (
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400">Vista previa</p>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{previewName}</p>
              </div>
            )}
          </div>
        </InlineEditField>

        <InlineEditField
          label="Año académico"
          displayValue={resolvedAcademicYear}
          editingKey={editingKey}
          fieldKey="academicYear"
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onSave={saveField}
          saving={saving}
        >
          <AcademicYearPicker
            value={draft.academicYear ?? resolvedAcademicYear}
            onChange={(nextValue) => setDraft((previous) => ({ ...previous, academicYear: nextValue }))}
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Formato obligatorio YYYY-YYYY. Este valor se hereda automáticamente en las clases vinculadas.
          </p>
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
            <span className="inline-flex items-center gap-2">
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