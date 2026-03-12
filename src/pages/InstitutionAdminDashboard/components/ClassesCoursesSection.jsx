// src/pages/InstitutionAdminDashboard/components/ClassesCoursesSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Orchestrator: owns navigation state (which tab / which item / which modal)
// and delegates all data ops to useClassesCourses, all rendering to sub-components.

import React, { useState } from 'react';
import { FolderOpen, LayoutGrid, Loader2, Plus } from 'lucide-react';

import { useClassesCourses } from '../hooks/useClassesCourses.js';
import CourseList            from './classes-courses/CourseList.jsx';
import CourseDetail          from './classes-courses/CourseDetail.jsx';
import ClassList             from './classes-courses/ClassList.jsx';
import ClassDetail           from './classes-courses/ClassDetail.jsx';
import CreateCourseModal     from '../modals/CreateCourseModal.jsx';
import CreateClassModal      from '../modals/CreateClassModal.jsx';

const TAB_COURSES = 'courses';
const TAB_CLASSES = 'classes';

const ClassesCoursesSection = ({ user, allStudents, allTeachers }) => {
  // ── Navigation ─────────────────────────────────────────────────────────────
  const [tab,            setTab]            = useState(TAB_COURSES);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass,  setSelectedClass]  = useState(null);
  const [jumpToEdit,     setJumpToEdit]     = useState(false);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [showCourseModal,  setShowCourseModal]  = useState(false);
  const [courseModalErr,   setCourseModalErr]   = useState('');
  const [courseSubmitting, setCourseSubmitting] = useState(false);

  const [showClassModal,   setShowClassModal]   = useState(false);
  const [classModalErr,    setClassModalErr]    = useState('');
  const [classSubmitting,  setClassSubmitting]  = useState(false);

  // ── Data ────────────────────────────────────────────────────────────────────
  const {
    courses, classes, loading,
    createCourse, updateCourse, deleteCourse,
    createClass,  updateClass,  deleteClass,
  } = useClassesCourses(user);

  // ── Tab switch ──────────────────────────────────────────────────────────────
  const switchTab = (next) => {
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

  // ── Course handlers ─────────────────────────────────────────────────────────
  const handleCreateCourse = async (form) => {
    setCourseModalErr('');
    if (!form.name.trim()) { setCourseModalErr('El nombre es obligatorio.'); return; }
    setCourseSubmitting(true);
    try {
      await createCourse(form);
      setShowCourseModal(false);
    } catch { setCourseModalErr('Error al crear el curso.'); }
    finally { setCourseSubmitting(false); }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('¿Eliminar este curso? Las clases asociadas no se eliminarán.')) return;
    await deleteCourse(id);
    if (selectedCourse?.id === id) setSelectedCourse(null);
  };

  const handleUpdateCourseField = async (id, patch) => {
    await updateCourse(id, patch);
    setSelectedCourse(prev => prev ? { ...prev, ...patch } : prev);
  };

  // ── Class handlers ──────────────────────────────────────────────────────────
  const handleCreateClass = async (form) => {
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

  const handleDeleteClass = async (id) => {
    if (!window.confirm('¿Eliminar esta clase?')) return;
    await deleteClass(id);
    if (selectedClass?.id === id) setSelectedClass(null);
  };

  const handleUpdateClassField = async (id, patch) => {
    await updateClass(id, patch);
    setSelectedClass(prev => prev ? { ...prev, ...patch } : prev);
  };

  const handleSelectClass = (cl) => { setSelectedClass(cl); setJumpToEdit(false); };
  const handleEditClass   = (cl) => { setSelectedClass(cl); setJumpToEdit(true);  };

  const showingDetail = selectedCourse || selectedClass;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Toolbar ── */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {[
            { key: TAB_COURSES, label: 'Cursos', icon: FolderOpen },
            { key: TAB_CLASSES, label: 'Clases', icon: LayoutGrid },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                tab === key
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
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