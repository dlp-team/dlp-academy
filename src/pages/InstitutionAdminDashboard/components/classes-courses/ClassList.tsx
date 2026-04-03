// src/pages/InstitutionAdminDashboard/components/classes-courses/ClassList.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Table of all classes. Row click → detail view. Hover actions: edit, delete.

import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, LayoutGrid, Trash2 } from 'lucide-react';
import TablePagination from '../../../../components/ui/TablePagination';

const CLASS_PAGE_SIZE = 15;

const ClassList = ({ classes, courses, allTeachers, onSelect, onEdit, onDelete }: any) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(classes.length / CLASS_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const visibleClasses = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * CLASS_PAGE_SIZE;
    return classes.slice(startIndex, startIndex + CLASS_PAGE_SIZE);
  }, [classes, safeCurrentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const getCourseName  = (id) => courses.find(c => c.id === id)?.name || '—';
  const getCourseColor = (id) => courses.find(c => c.id === id)?.color || '#6366f1';
  const getTeacherName = (id: any) => {
    const t = allTeachers.find(t => t.id === id);
    return t ? (t.displayName || t.email) : '—';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-indigo-500" />
          Clases registradas
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Curso</th>
              <th className="px-6 py-4">Profesor</th>
              <th className="px-6 py-4">Alumnos</th>
              <th className="px-6 py-4 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {classes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No hay clases creadas todavía.
                </td>
              </tr>
            ) : (
              visibleClasses.map(cl => {
                const color = getCourseColor(cl.courseId);
                return (
                  <tr
                    key={cl.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group"
                    onClick={() => onSelect(cl)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        {cl.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getCourseName(cl.courseId)}</td>
                    <td className="px-6 py-4">{getTeacherName(cl.teacherId)}</td>
                    <td className="px-6 py-4">{cl.studentIds?.length || 0} alumno{(cl.studentIds?.length || 0) !== 1 ? 's' : ''}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); onEdit(cl); }}
                          className="text-slate-400 hover:text-indigo-500 p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); onDelete(cl.id); }}
                          className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ClassList;