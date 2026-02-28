import React, { useEffect, useState } from 'react';
import { FolderOpen, LayoutGrid, Loader2, Plus, Save, Trash2, XCircle } from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../../../firebase/config';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XCircle className="w-6 h-6" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const ClassesCoursesSection = ({ user, allStudents, allTeachers }) => {
  const [view, setView] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: '', description: '', color: '#6366f1' });
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseError, setCourseError] = useState('');

  const [showClassModal, setShowClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', courseId: '', teacherId: '', studentIds: [] });
  const [classSubmitting, setClassSubmitting] = useState(false);
  const [classError, setClassError] = useState('');

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

  const fetchAll = async () => {
    if (!user?.institutionId) return;
    setLoading(true);
    try {
      const [cSnap, clSnap] = await Promise.all([
        getDocs(query(collection(db, 'courses'), where('institutionId', '==', user.institutionId))),
        getDocs(query(collection(db, 'classes'), where('institutionId', '==', user.institutionId))),
      ]);
      setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setClasses(clSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCourseError('');
    if (!courseForm.name.trim()) {
      setCourseError('El nombre es obligatorio.');
      return;
    }
    setCourseSubmitting(true);
    try {
      await addDoc(collection(db, 'courses'), {
        ...courseForm,
        institutionId: user.institutionId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setShowCourseModal(false);
      setCourseForm({ name: '', description: '', color: '#6366f1' });
      fetchAll();
    } catch {
      setCourseError('Error al crear el curso.');
    } finally {
      setCourseSubmitting(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setClassError('');
    if (!classForm.name.trim()) {
      setClassError('El nombre es obligatorio.');
      return;
    }
    setClassSubmitting(true);
    try {
      await addDoc(collection(db, 'classes'), {
        ...classForm,
        institutionId: user.institutionId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setShowClassModal(false);
      setClassForm({ name: '', courseId: '', teacherId: '', studentIds: [] });
      fetchAll();
    } catch {
      setClassError('Error al crear la clase.');
    } finally {
      setClassSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('¿Eliminar este curso?')) return;
    await deleteDoc(doc(db, 'courses', id));
    fetchAll();
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('¿Eliminar esta clase?')) return;
    await deleteDoc(doc(db, 'classes', id));
    fetchAll();
  };

  const toggleStudent = (id) => setClassForm(p => ({
    ...p,
    studentIds: p.studentIds.includes(id) ? p.studentIds.filter(s => s !== id) : [...p.studentIds, id],
  }));

  const getCourseName = (id) => courses.find(c => c.id === id)?.name || '—';
  const getTeacherName = (id) => {
    const teacher = allTeachers.find(t => t.id === id);
    return teacher ? (teacher.displayName || teacher.email) : '—';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {[
            { key: 'courses', label: 'Cursos', icon: FolderOpen },
            { key: 'classes', label: 'Clases', icon: LayoutGrid },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                view === key
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => (view === 'courses' ? setShowCourseModal(true) : setShowClassModal(true))}
          className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-[var(--color-primary-200)] dark:shadow-[var(--color-primary-900)/0.2] transition-all active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          {view === 'courses' ? 'Nuevo Curso' : 'Nueva Clase'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
      ) : (
        <>
          {view === 'courses' && (
            courses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No hay cursos creados todavía.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group">
                    <div className="h-1.5" style={{ backgroundColor: course.color || '#6366f1' }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-slate-900 dark:text-white">{course.name}</h4>
                        <button onClick={() => handleDeleteCourse(course.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {course.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{course.description}</p>}
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-3">
                        <LayoutGrid className="w-3.5 h-3.5" />
                        {classes.filter(cl => cl.courseId === course.id).length} clase(s)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {view === 'classes' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-500" /> Clases Registradas
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
                      <th className="px-6 py-4 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {classes.length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400">No hay clases creadas todavía.</td></tr>
                    ) : classes.map(cl => (
                      <tr key={cl.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{cl.name}</td>
                        <td className="px-6 py-4">{getCourseName(cl.courseId)}</td>
                        <td className="px-6 py-4">{getTeacherName(cl.teacherId)}</td>
                        <td className="px-6 py-4">{cl.studentIds?.length || 0} alumno(s)</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteClass(cl.id)} className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {showCourseModal && (
        <Modal title="Crear Curso" onClose={() => { setShowCourseModal(false); setCourseError(''); }}>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Curso *</label>
              <input
                type="text"
                placeholder="Ej: Bachillerato 2025"
                value={courseForm.name}
                onChange={e => setCourseForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
              <textarea
                placeholder="Descripción opcional..."
                value={courseForm.description}
                rows={2}
                onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCourseForm(p => ({ ...p, color: c }))}
                    className={`w-7 h-7 rounded-full transition-all ${courseForm.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            {courseError && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="w-4 h-4" />{courseError}</p>}
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setShowCourseModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all">Cancelar</button>
              <button type="submit" disabled={courseSubmitting} className="flex-1 px-4 py-2.5 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-xl font-medium shadow-lg shadow-[var(--color-primary-200)] dark:shadow-[var(--color-primary-900)/0.2] transition-all flex justify-center items-center gap-2">
                {courseSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Crear</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showClassModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Crear Clase</h3>
              <button onClick={() => { setShowClassModal(false); setClassError(''); }} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre de la Clase *</label>
                <input
                  type="text"
                  placeholder="Ej: 1º ESO – Grupo A"
                  value={classForm.name}
                  onChange={e => setClassForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Curso (opcional)</label>
                <select
                  value={classForm.courseId}
                  onChange={e => setClassForm(p => ({ ...p, courseId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  <option value="">Sin curso asignado</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profesor responsable</label>
                <select
                  value={classForm.teacherId}
                  onChange={e => setClassForm(p => ({ ...p, teacherId: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                >
                  <option value="">Sin asignar</option>
                  {allTeachers.map(t => <option key={t.id} value={t.id}>{t.displayName || t.email}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alumnos <span className="text-slate-400 font-normal">({classForm.studentIds.length} seleccionados)</span>
                </label>
                <div className="max-h-44 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-700">
                  {allStudents.length === 0
                    ? <p className="text-xs text-slate-400 text-center py-4">No hay alumnos registrados.</p>
                    : allStudents.map(s => (
                      <label key={s.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={classForm.studentIds.includes(s.id)}
                          onChange={() => toggleStudent(s.id)}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{s.displayName || s.email}</span>
                      </label>
                    ))}
                </div>
              </div>
              {classError && <p className="text-sm text-red-500 flex items-center gap-1"><XCircle className="w-4 h-4" />{classError}</p>}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all">Cancelar</button>
                <button type="submit" disabled={classSubmitting} className="flex-1 px-4 py-2.5 bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white rounded-xl font-medium shadow-lg shadow-[var(--color-primary-200)] dark:shadow-[var(--color-primary-900)/0.2] transition-all flex justify-center items-center gap-2">
                  {classSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Crear Clase</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassesCoursesSection;
