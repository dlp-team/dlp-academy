// src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Orchestrator: owns navigation state (which tab / which item / which modal)
// and delegates all data ops to useClassesCourses, all rendering to sub-components.

import React from 'react';
import { FolderOpen, LayoutGrid, Loader2, Plus } from 'lucide-react';

import { useClassesCourses } from '../hooks/useClassesCourses.js';
import CourseList            from './classes-courses/CourseList.jsx';
import CourseDetail          from './classes-courses/CourseDetail.jsx';
import ClassList             from './classes-courses/ClassList.jsx';
import ClassDetail           from './classes-courses/ClassDetail.jsx';
import CreateCourseModal     from '../modals/CreateCourseModal.jsx';
import CreateClassModal      from '../modals/CreateClassModal.jsx';
import { usePersistentState } from '../../../hooks/usePersistentState.js';
import { buildInstitutionScopedPersistenceKey } from '../../../utils/pagePersistence.js';

const TAB_COURSES = 'courses';
const TAB_CLASSES = 'classes';
const INITIAL_DELETE_CONFIRM_STATE = {
  isOpen: false,
  targetType: null,
  targetId: null,
  targetName: '',
};

const ClassesCoursesSection = ({ user, institutionId, allStudents, allTeachers }: any) => {
  const tabKey = buildInstitutionScopedPersistenceKey('institution-admin-organization', institutionId, 'tab');
  // ── Navigation ─────────────────────────────────────────────────────────────
  const [tab,            setTab]            = usePersistentState(tabKey, TAB_COURSES);
  const [selectedCourse, setSelectedCourse] = React.useState<any>(null);
  const [selectedClass,  setSelectedClass]  = React.useState<any>(null);
  const [jumpToEdit,     setJumpToEdit]     = React.useState(false);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [showCourseModal,  setShowCourseModal]  = React.useState(false);
  const [courseModalErr,   setCourseModalErr]   = React.useState('');
  const [courseSubmitting, setCourseSubmitting] = React.useState(false);

  const [showClassModal,   setShowClassModal]   = React.useState(false);
  const [classModalErr,    setClassModalErr]    = React.useState('');
  const [classSubmitting,  setClassSubmitting]  = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(INITIAL_DELETE_CONFIRM_STATE);
  const [isDeletingItem, setIsDeletingItem] = React.useState(false);

  // ── Data ────────────────────────────────────────────────────────────────────
  const {
    courses, classes, loading,
    createCourse, updateCourse, deleteCourse,
    createClass,  updateClass,  deleteClass,
  } = useClassesCourses(user, institutionId);

  // ── Tab switch ──────────────────────────────────────────────────────────────
  const switchTab = (next: any) => {
    setTab(next);
    setSelectedCourse(null);
    setSelectedClass(null);
    setJumpToEdit(false);
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setSelectedClass(null);
    setJumpToEdit(false);
  };

  const queueDeleteConfirm = (targetType, id: any) => {
    if (!id || isDeletingItem) return;

    const isCourseTarget = targetType === TAB_COURSES;
    const sourceItems = isCourseTarget ? courses : classes;
    const selectedItem = sourceItems.find((item) => item.id === id);

    setDeleteConfirm({
      isOpen: true,
      targetType,
      targetId: id,
      targetName: selectedItem?.name || (isCourseTarget ? 'este curso' : 'esta clase'),
    });
  };

  const closeDeleteConfirm = () => {
    if (isDeletingItem) return;
    setDeleteConfirm(INITIAL_DELETE_CONFIRM_STATE);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.targetId || isDeletingItem) return;

    setIsDeletingItem(true);

    try {
      if (deleteConfirm.targetType === TAB_COURSES) {
        await deleteCourse(deleteConfirm.targetId);
        if (selectedCourse?.id === deleteConfirm.targetId) setSelectedCourse(null);
      } else {
        await deleteClass(deleteConfirm.targetId);
        if (selectedClass?.id === deleteConfirm.targetId) setSelectedClass(null);
      }
    } finally {
      setIsDeletingItem(false);
      setDeleteConfirm(INITIAL_DELETE_CONFIRM_STATE);
    }
  };

  // ── Course handlers ─────────────────────────────────────────────────────────
  const handleCreateCourse = async (form: any) => {
    setCourseModalErr('');
    if (!form.name.trim()) { setCourseModalErr('El nombre es obligatorio.'); return; }
    setCourseSubmitting(true);
    try {
      await createCourse(form);
      setShowCourseModal(false);
    } catch { setCourseModalErr('Error al crear el curso.'); }
    finally { setCourseSubmitting(false); }
  };

  const handleDeleteCourse = (id: any) => {
    queueDeleteConfirm(TAB_COURSES, id);
  };

  const handleUpdateCourseField = async (id, patch: any) => {
    await updateCourse(id, patch);
    setSelectedCourse(prev => prev ? { ...prev, ...patch } : prev);
  };

  // ── Class handlers ──────────────────────────────────────────────────────────
  const handleCreateClass = async (form: any) => {
    setClassModalErr('');
    if (!form.courseId)     { setClassModalErr('El curso es obligatorio.');         return; }
    if (!form.name?.trim()) { setClassModalErr('El identificador es obligatorio.'); return; }
    setClassSubmitting(true);
    try {
      await createClass(form);
      setShowClassModal(false);
    } catch { setClassModalErr('Error al crear la clase.'); }
    finally { setClassSubmitting(false); }
  };

  const handleDeleteClass = (id: any) => {
    queueDeleteConfirm(TAB_CLASSES, id);
  };

  const handleUpdateClassField = async (id, patch: any) => {
    await updateClass(id, patch);
    setSelectedClass(prev => prev ? { ...prev, ...patch } : prev);
  };

  const handleSelectClass = (cl: any) => { setSelectedClass(cl); setJumpToEdit(false); };
  const handleEditClass   = (cl: any) => { setSelectedClass(cl); setJumpToEdit(true);  };

  const showingDetail = selectedCourse || selectedClass;
  const deletingCourse = deleteConfirm.targetType === TAB_COURSES;
  const deleteDialogTitle = deletingCourse ? 'Eliminar curso' : 'Eliminar clase';
  const deleteDialogActionLabel = deletingCourse ? 'Eliminar curso' : 'Eliminar clase';
  const deleteDialogMessage = deletingCourse
    ? `Se eliminará "${deleteConfirm.targetName || 'este curso'}". Las clases asociadas no se eliminarán. Esta acción no se puede deshacer.`
    : `Se eliminará "${deleteConfirm.targetName || 'esta clase'}". Esta acción no se puede deshacer.`;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Toolbar ── */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {[
            { key: TAB_COURSES, label: 'Cursos', icon: FolderOpen },
            { key: TAB_CLASSES, label: 'Clases', icon: LayoutGrid },
          ].map(({ key, label, icon }: any) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                tab === key
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {React.createElement(icon, { className: 'w-4 h-4' })} {label}
            </button>
          ))}
        </div>

        {!showingDetail && (
          <button
            onClick={() => tab === TAB_COURSES ? setShowCourseModal(true) : setShowClassModal(true)}
            className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white
              px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg
              shadow-[var(--color-primary-200)] dark:shadow-[var(--color-primary-900)/0.2]
              transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            {tab === TAB_COURSES ? 'Nuevo Curso' : 'Nueva Clase'}
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {/* COURSES */}
          {tab === TAB_COURSES && (
            selectedCourse ? (
              <CourseDetail
                course={selectedCourse}
                classes={classes}
                allTeachers={allTeachers}
                onBack={handleBack}
                onDelete={() => handleDeleteCourse(selectedCourse.id)}
                onUpdateField={handleUpdateCourseField}
              />
            ) : (
              <CourseList
                courses={courses}
                classes={classes}
                onSelect={setSelectedCourse}
                onDelete={handleDeleteCourse}
              />
            )
          )}

          {/* CLASSES */}
          {tab === TAB_CLASSES && (
            selectedClass ? (
              <ClassDetail
                cls={selectedClass}
                courses={courses}
                allTeachers={allTeachers}
                allStudents={allStudents}
                onBack={handleBack}
                onDelete={() => handleDeleteClass(selectedClass.id)}
                onUpdateField={handleUpdateClassField}
                initialEditKey={jumpToEdit ? 'identifier' : null}
              />
            ) : (
              <ClassList
                classes={classes}
                courses={courses}
                allTeachers={allTeachers}
                onSelect={handleSelectClass}
                onEdit={handleEditClass}
                onDelete={handleDeleteClass}
              />
            )
          )}
        </>
      )}

      {/* ── Modals ── */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60"
            onClick={closeDeleteConfirm}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="classes-courses-delete-title"
            className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
          >
            <div className="p-6">
              <h3 id="classes-courses-delete-title" className="text-lg font-black text-slate-900 dark:text-white">
                {deleteDialogTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {deleteDialogMessage}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDeleteConfirm}
                  disabled={isDeletingItem}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeletingItem}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeletingItem ? 'Eliminando...' : deleteDialogActionLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && (
        <CreateCourseModal
          onClose={() => { setShowCourseModal(false); setCourseModalErr(''); }}
          onSubmit={handleCreateCourse}
          submitting={courseSubmitting}
          error={courseModalErr}
        />
      )}

      {showClassModal && (
        <CreateClassModal
          onClose={() => { setShowClassModal(false); setClassModalErr(''); }}
          onSubmit={handleCreateClass}
          submitting={classSubmitting}
          error={classModalErr}
          courses={courses}
          allTeachers={allTeachers}
          allStudents={allStudents}
        />
      )}
    </div>
  );
};

export default ClassesCoursesSection;