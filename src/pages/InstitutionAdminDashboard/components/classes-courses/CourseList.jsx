// src/pages/InstitutionAdminDashboard/components/classes-courses/CourseList.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Grid of course cards. Clicking a card opens the detail view.

import React from 'react';
import { FolderOpen, LayoutGrid, Trash2 } from 'lucide-react';

const CourseCard = ({ course, classCount, onClick, onDelete }) => (
  <div
    className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200
      dark:border-slate-800 overflow-hidden group cursor-pointer
      hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    onClick={onClick}
  >
    <div className="h-1.5" style={{ backgroundColor: course.color || '#6366f1' }} />
    <div className="p-5">
      <div className="flex items-start justify-between mb-1 gap-2">
        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
          {course.name}
        </h4>
        <button
          onClick={e => { e.stopPropagation(); onDelete(course.id); }}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500
            p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all shrink-0"
          title="Eliminar curso"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {course.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
          {course.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <LayoutGrid className="w-3.5 h-3.5" />
          {classCount} clase{classCount !== 1 ? 's' : ''}
        </p>
        <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Ver detalles →
        </span>
      </div>
    </div>
  </div>
);

const CourseList = ({ courses, classes, onSelect, onDelete }) => {
  if (courses.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">No hay cursos creados todavía.</p>
        <p className="text-xs text-slate-400 mt-1">Pulsa «Nuevo Curso» para empezar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          classCount={classes.filter(cl => cl.courseId === course.id).length}
          onClick={() => onSelect(course)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CourseList;