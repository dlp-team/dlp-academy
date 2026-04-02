// src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Orchestrator: owns navigation state (which tab / which item / which modal)
// and delegates all data ops to useClassesCourses, all rendering to sub-components.

import React from 'react';
import { Archive, FolderOpen, LayoutGrid, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react';

import { useClassesCourses } from '../hooks/useClassesCourses';
import CourseList            from './classes-courses/CourseList';
import CourseDetail          from './classes-courses/CourseDetail';
import ClassList             from './classes-courses/ClassList';
import ClassDetail           from './classes-courses/ClassDetail';
import CreateCourseModal     from '../modals/CreateCourseModal';
import CreateClassModal      from '../modals/CreateClassModal';
import { usePersistentState } from '../../../hooks/usePersistentState';
import { buildInstitutionScopedPersistenceKey } from '../../../utils/pagePersistence';

const TAB_COURSES = 'courses';
const TAB_CLASSES = 'classes';
const TAB_BIN = 'bin';
const INITIAL_DELETE_CONFIRM_STATE = {
  isOpen: false,
  targetType: null,
  targetId: null,
  targetName: '',
  actionMode: 'trash',
  typedName: '',
  errorMessage: '',
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
  const [binActionLoadingKey, setBinActionLoadingKey] = React.useState('');
  const [binActionError, setBinActionError] = React.useState('');

  // ── Data ────────────────────────────────────────────────────────────────────
  const {
    courses, classes, trashedCourses, trashedClasses, loading,
    createCourse, updateCourse, deleteCourse,
    createClass,  updateClass,  deleteClass,
    restoreCourse, restoreClass,
    permanentlyDeleteCourse, permanentlyDeleteClass,
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

  const queueDeleteConfirm = (targetType, id: any, actionMode: any = 'trash') => {
    if (!id || isDeletingItem) return;

    const isCourseTarget = targetType === TAB_COURSES;
    const sourceItems = actionMode === 'permanent'
      ? (isCourseTarget ? trashedCourses : trashedClasses)
      : (isCourseTarget ? courses : classes);
    const selectedItem = sourceItems.find((item) => item.id === id);

    setDeleteConfirm({
      isOpen: true,
      targetType,
      targetId: id,
      targetName: selectedItem?.name || (isCourseTarget ? 'este curso' : 'esta clase'),
      actionMode,
      typedName: '',
      errorMessage: '',
    });
  };

  const closeDeleteConfirm = () => {
    if (isDeletingItem) return;
    setDeleteConfirm(INITIAL_DELETE_CONFIRM_STATE);
  };

  const updateDeleteTypedName = (value: any) => {
    setDeleteConfirm((prev: any) => ({
      ...prev,
      typedName: value,
      errorMessage: '',
    }));
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.targetId || isDeletingItem) return;

    if (deleteConfirm.actionMode === 'permanent') {
      const expectedName = String(deleteConfirm.targetName || '').trim().toLowerCase();
      const typedName = String(deleteConfirm.typedName || '').trim().toLowerCase();
      if (!typedName || typedName !== expectedName) {
        setDeleteConfirm((prev: any) => ({
          ...prev,
          errorMessage: 'Debes escribir el nombre exacto para confirmar esta acción.'
        }));
        return;
      }
    }

    setIsDeletingItem(true);
    let deleteSucceeded = false;

    try {
      if (deleteConfirm.actionMode === 'permanent') {
        if (deleteConfirm.targetType === TAB_COURSES) {
          await permanentlyDeleteCourse(deleteConfirm.targetId);
        } else {
          await permanentlyDeleteClass(deleteConfirm.targetId);
        }
      } else {
        if (deleteConfirm.targetType === TAB_COURSES) {
          await deleteCourse(deleteConfirm.targetId);
          if (selectedCourse?.id === deleteConfirm.targetId) setSelectedCourse(null);
        } else {
          await deleteClass(deleteConfirm.targetId);
          if (selectedClass?.id === deleteConfirm.targetId) setSelectedClass(null);
        }
      }

      deleteSucceeded = true;
    } catch {
      setDeleteConfirm((prev: any) => ({
        ...prev,
        errorMessage: 'No se pudo completar la operación. Inténtalo de nuevo.'
      }));
    } finally {
      setIsDeletingItem(false);
      if (deleteSucceeded) {
        setDeleteConfirm(INITIAL_DELETE_CONFIRM_STATE);
      }
    }
  };

  const runBinAction = async (actionKey: any, actionFn: any) => {
    setBinActionError('');
    setBinActionLoadingKey(actionKey);
    try {
      await actionFn();
    } catch {
      setBinActionError('No se pudo completar la acción en la papelera. Inténtalo de nuevo.');
    } finally {
      setBinActionLoadingKey('');
    }
  };

  const handleRestoreCourse = async (id: any) => {
    await runBinAction(`restore:${TAB_COURSES}:${id}`, () => restoreCourse(id));
  };

  const handleRestoreClass = async (id: any) => {
    await runBinAction(`restore:${TAB_CLASSES}:${id}`, () => restoreClass(id));
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
    queueDeleteConfirm(TAB_COURSES, id, 'trash');
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
    queueDeleteConfirm(TAB_CLASSES, id, 'trash');
  };

  const handleUpdateClassField = async (id, patch: any) => {
    await updateClass(id, patch);
    setSelectedClass(prev => prev ? { ...prev, ...patch } : prev);
  };

  const handleSelectClass = (cl: any) => { setSelectedClass(cl); setJumpToEdit(false); };
  const handleEditClass   = (cl: any) => { setSelectedClass(cl); setJumpToEdit(true);  };

  const showingDetail = selectedCourse || selectedClass;
  const isPermanentDelete = deleteConfirm.actionMode === 'permanent';
  const deletingCourse = deleteConfirm.targetType === TAB_COURSES;
  const normalizedDeleteTargetName = String(deleteConfirm.targetName || '').trim().toLowerCase();
  const normalizedDeleteTypedName = String(deleteConfirm.typedName || '').trim().toLowerCase();
  const isDeleteNameValid = normalizedDeleteTypedName.length > 0 && normalizedDeleteTypedName === normalizedDeleteTargetName;
  const deleteDialogTitle = isPermanentDelete
    ? (deletingCourse ? 'Eliminar curso definitivamente' : 'Eliminar clase definitivamente')
    : (deletingCourse ? 'Mover curso a papelera' : 'Mover clase a papelera');
  const deleteDialogActionLabel = isPermanentDelete ? 'Eliminar definitivamente' : 'Mover a papelera';
  const deleteDialogMessage = isPermanentDelete
    ? (deletingCourse
      ? `Se eliminará definitivamente "${deleteConfirm.targetName || 'este curso'}" junto con sus clases asociadas.`
      : `Se eliminará definitivamente "${deleteConfirm.targetName || 'esta clase'}".`)
    : (deletingCourse
      ? `"${deleteConfirm.targetName || 'Este curso'}" se moverá a la papelera junto con sus clases asociadas.`
      : `"${deleteConfirm.targetName || 'Esta clase'}" se moverá a la papelera.`);

  const formatTrashedDate = (value: any) => {
    if (!value) return 'Fecha no disponible';
    try {
      if (typeof value?.toDate === 'function') {
        return value.toDate().toLocaleDateString();
      }
      return new Date(value).toLocaleDateString();
    } catch {
      return 'Fecha no disponible';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Toolbar ── */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {[
            { key: TAB_COURSES, label: 'Cursos', icon: FolderOpen },
            { key: TAB_CLASSES, label: 'Clases', icon: LayoutGrid },
            { key: TAB_BIN, label: 'Papelera', icon: Archive },
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

        {!showingDetail && tab !== TAB_BIN && (
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

          {/* BIN */}
          {tab === TAB_BIN && (
            <div className="space-y-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Archive className="w-4 h-4 text-amber-500" />
                  Papelera de cursos y clases
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Aquí puedes restaurar elementos o eliminarlos definitivamente. La eliminación definitiva exige escribir el nombre exacto.
                </p>
              </div>

              {binActionError && (
                <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                  {binActionError}
                </div>
              )}

              {trashedCourses.length === 0 && trashedClasses.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                  <Archive className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">La papelera está vacía.</p>
                </div>
              ) : (
                <>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Cursos en papelera ({trashedCourses.length})</h4>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {trashedCourses.length === 0 ? (
                        <p className="px-5 py-4 text-sm text-slate-400">No hay cursos en papelera.</p>
                      ) : trashedCourses.map((course: any) => {
                        const restoreKey = `restore:${TAB_COURSES}:${course.id}`;
                        const restoreLoading = binActionLoadingKey === restoreKey;

                        return (
                          <div key={course.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{course.name}</p>
                              <p className="text-xs text-slate-400">En papelera desde: {formatTrashedDate(course.trashedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRestoreCourse(course.id)}
                                disabled={restoreLoading || isDeletingItem}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-60"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {restoreLoading ? 'Restaurando...' : 'Restaurar'}
                              </button>
                              <button
                                onClick={() => queueDeleteConfirm(TAB_COURSES, course.id, 'permanent')}
                                disabled={isDeletingItem}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-60"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar definitivamente
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="font-semibold text-slate-900 dark:text-white">Clases en papelera ({trashedClasses.length})</h4>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {trashedClasses.length === 0 ? (
                        <p className="px-5 py-4 text-sm text-slate-400">No hay clases en papelera.</p>
                      ) : trashedClasses.map((cls: any) => {
                        const restoreKey = `restore:${TAB_CLASSES}:${cls.id}`;
                        const restoreLoading = binActionLoadingKey === restoreKey;

                        return (
                          <div key={cls.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{cls.name}</p>
                              <p className="text-xs text-slate-400">En papelera desde: {formatTrashedDate(cls.trashedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRestoreClass(cls.id)}
                                disabled={restoreLoading || isDeletingItem}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-60"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {restoreLoading ? 'Restaurando...' : 'Restaurar'}
                              </button>
                              <button
                                onClick={() => queueDeleteConfirm(TAB_CLASSES, cls.id, 'permanent')}
                                disabled={isDeletingItem}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-60"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar definitivamente
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
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
              {isPermanentDelete && (
                <div className="mt-4 space-y-2">
                  <label
                    htmlFor="delete-confirm-name"
                    className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    Escribe el nombre exacto para confirmar
                  </label>
                  <input
                    id="delete-confirm-name"
                    type="text"
                    value={deleteConfirm.typedName}
                    onChange={(event) => updateDeleteTypedName(event.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder={deleteConfirm.targetName || 'Nombre del elemento'}
                    autoComplete="off"
                  />
                </div>
              )}
              {deleteConfirm.errorMessage && (
                <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-300">
                  {deleteConfirm.errorMessage}
                </p>
              )}
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
                  disabled={isDeletingItem || (isPermanentDelete && !isDeleteNameValid)}
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