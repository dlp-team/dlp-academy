// src/pages/SchoolAdminDashboard/SchoolAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, UserPlus, Search, CheckCircle2, XCircle,
    Palette, Loader2, Trash2, GraduationCap, BookOpen,
    LayoutGrid, Plus, ChevronRight, FolderOpen, School,
    Edit2, X, Save, Hash
} from 'lucide-react';
import {
    collection, query, where, getDocs,
    addDoc, serverTimestamp, deleteDoc, doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../../components/layout/Header';

// ─────────────────────────────────────────────────────────────────────────────
// Helper badge
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge = ({ enabled }) =>
    enabled !== false ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Activo
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3" /> Deshabilitado
        </span>
    );

// ─────────────────────────────────────────────────────────────────────────────
// MODAL: Generic modal wrapper
// ─────────────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-6 h-6" />
                </button>
            </div>
            {children}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CLASSES & COURSES SECTION
// ─────────────────────────────────────────────────────────────────────────────
const ClassesCoursesSection = ({ user, students, teachers }) => {
    const [view, setView] = useState('courses'); // 'courses' | 'classes'
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Course modal
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courseForm, setCourseForm] = useState({ name: '', description: '', color: '#6366f1' });
    const [courseSubmitting, setCourseSubmitting] = useState(false);
    const [courseError, setCourseError] = useState('');

    // Class modal
    const [showClassModal, setShowClassModal] = useState(false);
    const [classForm, setClassForm] = useState({ name: '', courseId: '', teacherId: '', studentIds: [] });
    const [classSubmitting, setClassSubmitting] = useState(false);
    const [classError, setClassError] = useState('');

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];

    const fetchCoursesAndClasses = async () => {
        if (!user?.schoolId) return;
        setLoading(true);
        try {
            const [cSnap, clSnap] = await Promise.all([
                getDocs(query(collection(db, 'courses'), where('schoolId', '==', user.schoolId))),
                getDocs(query(collection(db, 'classes'), where('schoolId', '==', user.schoolId))),
            ]);
            setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setClasses(clSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoursesAndClasses(); }, [user]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setCourseError('');
        if (!courseForm.name.trim()) { setCourseError('El nombre es obligatorio.'); return; }
        setCourseSubmitting(true);
        try {
            await addDoc(collection(db, 'courses'), {
                ...courseForm,
                schoolId: user.schoolId,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
            setShowCourseModal(false);
            setCourseForm({ name: '', description: '', color: '#6366f1' });
            fetchCoursesAndClasses();
        } catch (e) {
            setCourseError('Error al crear el curso.');
        } finally {
            setCourseSubmitting(false);
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setClassError('');
        if (!classForm.name.trim()) { setClassError('El nombre es obligatorio.'); return; }
        setClassSubmitting(true);
        try {
            await addDoc(collection(db, 'classes'), {
                ...classForm,
                schoolId: user.schoolId,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });
            setShowClassModal(false);
            setClassForm({ name: '', courseId: '', teacherId: '', studentIds: [] });
            fetchCoursesAndClasses();
        } catch (e) {
            setClassError('Error al crear la clase.');
        } finally {
            setClassSubmitting(false);
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('¿Eliminar este curso? Las clases asociadas no se eliminarán automáticamente.')) return;
        await deleteDoc(doc(db, 'courses', id));
        fetchCoursesAndClasses();
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm('¿Eliminar esta clase?')) return;
        await deleteDoc(doc(db, 'classes', id));
        fetchCoursesAndClasses();
    };

    const toggleStudentInClass = (studentId) => {
        setClassForm(prev => ({
            ...prev,
            studentIds: prev.studentIds.includes(studentId)
                ? prev.studentIds.filter(id => id !== studentId)
                : [...prev.studentIds, studentId]
        }));
    };

    const getCourseName = (courseId) => courses.find(c => c.id === courseId)?.name || '—';
    const getTeacherName = (teacherId) => {
        const t = teachers.find(t => t.id === teacherId);
        return t ? (t.displayName || t.email) : '—';
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Sub-nav */}
            <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                    {[
                        { key: 'courses', label: 'Cursos', icon: FolderOpen },
                        { key: 'classes', label: 'Clases', icon: LayoutGrid },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setView(key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                view === key
                                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="ml-auto">
                    {view === 'courses' && (
                        <button
                            onClick={() => setShowCourseModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
                        >
                            <Plus className="w-4 h-4" /> Nuevo Curso
                        </button>
                    )}
                    {view === 'classes' && (
                        <button
                            onClick={() => setShowClassModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
                        >
                            <Plus className="w-4 h-4" /> Nueva Clase
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : (
                <>
                    {/* COURSES VIEW */}
                    {view === 'courses' && (
                        <div>
                            {courses.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No hay cursos creados todavía.</p>
                                    <button onClick={() => setShowCourseModal(true)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
                                        Crear primer curso
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {courses.map(course => {
                                        const courseClasses = classes.filter(cl => cl.courseId === course.id);
                                        return (
                                            <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                                <div className="h-2" style={{ backgroundColor: course.color || '#6366f1' }} />
                                                <div className="p-5">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{course.name}</h4>
                                                        <button
                                                            onClick={() => handleDeleteCourse(course.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {course.description && (
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{course.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-auto">
                                                        <LayoutGrid className="w-3.5 h-3.5" />
                                                        <span>{courseClasses.length} clase{courseClasses.length !== 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CLASSES VIEW */}
                    {view === 'classes' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {classes.length === 0 ? (
                                <div className="text-center py-20">
                                    <LayoutGrid className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-slate-500 font-medium">No hay clases creadas todavía.</p>
                                    <button onClick={() => setShowClassModal(true)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
                                        Crear primera clase
                                    </button>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4">Nombre</th>
                                            <th className="px-6 py-4">Curso</th>
                                            <th className="px-6 py-4">Profesor</th>
                                            <th className="px-6 py-4">Alumnos</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {classes.map(cl => (
                                            <tr key={cl.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{cl.name}</td>
                                                <td className="px-6 py-4">
                                                    {cl.courseId ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                            <FolderOpen className="w-3 h-3" /> {getCourseName(cl.courseId)}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-6 py-4">{getTeacherName(cl.teacherId)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                                                        <Users className="w-3 h-3" /> {cl.studentIds?.length || 0} alumno{(cl.studentIds?.length || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteClass(cl.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* MODAL: CREATE COURSE */}
            {showCourseModal && (
                <Modal title="Crear Curso" onClose={() => { setShowCourseModal(false); setCourseError(''); }}>
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Curso *</label>
                            <input
                                type="text"
                                placeholder="Ej: Bachillerato 2025"
                                value={courseForm.name}
                                onChange={e => setCourseForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                            <textarea
                                placeholder="Descripción opcional..."
                                value={courseForm.description}
                                onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color identificador</label>
                            <div className="flex gap-2">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setCourseForm(p => ({ ...p, color: c }))}
                                        className={`w-7 h-7 rounded-full transition-all ${courseForm.color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        {courseError && <p className="text-sm text-red-500">{courseError}</p>}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowCourseModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium text-sm transition-all">Cancelar</button>
                            <button type="submit" disabled={courseSubmitting} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex justify-center items-center gap-2">
                                {courseSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Crear Curso</>}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* MODAL: CREATE CLASS */}
            {showClassModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Crear Clase</h3>
                            <button onClick={() => { setShowClassModal(false); setClassError(''); }} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleCreateClass} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Clase *</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 1º ESO – Grupo A"
                                    value={classForm.name}
                                    onChange={e => setClassForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Curso (opcional)</label>
                                <select
                                    value={classForm.courseId}
                                    onChange={e => setClassForm(p => ({ ...p, courseId: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                >
                                    <option value="">Sin curso asignado</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profesor responsable</label>
                                <select
                                    value={classForm.teacherId}
                                    onChange={e => setClassForm(p => ({ ...p, teacherId: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                >
                                    <option value="">Sin asignar</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.displayName || t.email}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Alumnos ({classForm.studentIds.length} seleccionados)
                                </label>
                                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-700">
                                    {students.length === 0 ? (
                                        <p className="text-xs text-slate-400 text-center py-4">No hay alumnos registrados.</p>
                                    ) : students.map(s => (
                                        <label key={s.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={classForm.studentIds.includes(s.id)}
                                                onChange={() => toggleStudentInClass(s.id)}
                                                className="rounded text-indigo-600"
                                            />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{s.displayName || s.email}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {classError && <p className="text-sm text-red-500">{classError}</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium text-sm transition-all">Cancelar</button>
                                <button type="submit" disabled={classSubmitting} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex justify-center items-center gap-2">
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const SchoolAdminDashboard = ({ user }) => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('users');
    const [userType, setUserType] = useState('teachers');

    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [allowedTeachers, setAllowedTeachers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');

    useEffect(() => {
        if (user && user.role !== 'schooladmin') {
            navigate('/home');
        }
    }, [user, navigate]);

    const fetchData = async () => {
        if (!user?.schoolId) return;
        setLoading(true);
        try {
            if (userType === 'teachers') {
                const [teachersSnap, allowedSnap] = await Promise.all([
                    getDocs(query(collection(db, 'users'), where('schoolId', '==', user.schoolId), where('role', '==', 'teacher'))),
                    getDocs(query(collection(db, 'allowed_teachers'), where('schoolId', '==', user.schoolId))),
                ]);
                setTeachers(teachersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setAllowedTeachers(allowedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setStudents([]);
            } else {
                const studentsSnap = await getDocs(query(collection(db, 'users'), where('schoolId', '==', user.schoolId), where('role', '==', 'student')));
                setStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setTeachers([]);
                setAllowedTeachers([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user, userType]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddError(''); setAddSuccess(''); setIsSubmitting(true);
        if (!newUserEmail.includes('@')) { setAddError('Por favor introduce un email válido.'); setIsSubmitting(false); return; }
        try {
            const checkSnap = await getDocs(query(collection(db, 'allowed_teachers'), where('email', '==', newUserEmail), where('schoolId', '==', user.schoolId)));
            if (!checkSnap.empty) { setAddError('Este email ya está autorizado.'); setIsSubmitting(false); return; }
            await addDoc(collection(db, 'allowed_teachers'), {
                email: newUserEmail.toLowerCase().trim(),
                schoolId: user.schoolId,
                addedBy: user.uid,
                createdAt: serverTimestamp(),
                enabled: true,
            });
            setAddSuccess(`Acceso concedido a ${newUserEmail}`);
            setNewUserEmail('');
            fetchData();
        } catch (error) {
            setAddError('Error al guardar en la base de datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveAccess = async (docId) => {
        if (!window.confirm('¿Seguro que quieres eliminar el acceso a este profesor?')) return;
        await deleteDoc(doc(db, 'allowed_teachers', docId));
        fetchData();
    };

    const TABS = [
        { key: 'users', label: 'Usuarios', icon: Users },
        { key: 'organization', label: 'Cursos y Clases', icon: LayoutGrid },
        { key: 'customization', label: 'Personalización', icon: Palette },
    ];

    const filteredTeachers = teachers.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredStudents = students.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Collect all students for ClassesCoursesSection (need full list regardless of tab)
    const [allStudents, setAllStudents] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);

    useEffect(() => {
        if (!user?.schoolId) return;
        Promise.all([
            getDocs(query(collection(db, 'users'), where('schoolId', '==', user.schoolId), where('role', '==', 'student'))),
            getDocs(query(collection(db, 'users'), where('schoolId', '==', user.schoolId), where('role', '==', 'teacher'))),
        ]).then(([sSnap, tSnap]) => {
            setAllStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setAllTeachers(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header user={user} />

            <main className="pt-20 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8 mt-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <School className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel de Administración</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 ml-12 text-sm">Gestiona usuarios, organización y apariencia de tu institución.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 w-fit">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                activeTab === key
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── USERS TAB ─────────────────────────────────────────── */}
                {activeTab === 'users' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Profesores / Alumnos toggle + search + actions */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            {/* Toggle card */}
                            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 gap-1 shadow-sm">
                                <button
                                    onClick={() => { setUserType('teachers'); setSearchTerm(''); }}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        userType === 'teachers'
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Profesores
                                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${userType === 'teachers' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                        {teachers.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => { setUserType('students'); setSearchTerm(''); }}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        userType === 'students'
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    Alumnos
                                    <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${userType === 'students' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                        {students.length}
                                    </span>
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                />
                            </div>

                            {/* Add button – only for teachers */}
                            {userType === 'teachers' && (
                                <button
                                    onClick={() => setShowAddUserModal(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 ml-auto"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Autorizar Profesor
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : (
                            <>
                                {/* ── TEACHERS ── */}
                                {userType === 'teachers' && (
                                    <div className="space-y-4">
                                        {/* Active teachers */}
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-indigo-500" />
                                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Profesores Registrados</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                                        <tr>
                                                            <th className="px-6 py-4">Nombre</th>
                                                            <th className="px-6 py-4">Email</th>
                                                            <th className="px-6 py-4">Estado</th>
                                                            <th className="px-6 py-4"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {filteredTeachers.map(u => (
                                                            <tr
                                                                key={u.id}
                                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                                                onClick={() => navigate(`/school-admin-dashboard/teacher/${u.id}`)}
                                                            >
                                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                        {(u.displayName?.[0] || u.email?.[0] || '?').toUpperCase()}
                                                                    </div>
                                                                    {u.displayName || 'Sin nombre'}
                                                                </td>
                                                                <td className="px-6 py-4">{u.email}</td>
                                                                <td className="px-6 py-4"><StatusBadge enabled={u.enabled} /></td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {filteredTeachers.length === 0 && (
                                                            <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No hay profesores registrados.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Whitelist */}
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2">
                                                <UserPlus className="w-4 h-4 text-amber-500" />
                                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Lista Blanca — Accesos Autorizados</h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                                        <tr>
                                                            <th className="px-6 py-4">Email autorizado</th>
                                                            <th className="px-6 py-4 text-right">Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {allowedTeachers.map(t => (
                                                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                                <td className="px-6 py-4">{t.email}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <button
                                                                        onClick={() => handleRemoveAccess(t.id)}
                                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {allowedTeachers.length === 0 && (
                                                            <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400">No hay accesos autorizados aún.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── STUDENTS ── */}
                                {userType === 'students' && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-blue-500" />
                                            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Alumnos Registrados</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                                    <tr>
                                                        <th className="px-6 py-4">Nombre</th>
                                                        <th className="px-6 py-4">Email</th>
                                                        <th className="px-6 py-4">Estado</th>
                                                        <th className="px-6 py-4"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {filteredStudents.map(u => (
                                                        <tr
                                                            key={u.id}
                                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                                            onClick={() => navigate(`/school-admin-dashboard/student/${u.id}`)}
                                                        >
                                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                                    {(u.displayName?.[0] || u.email?.[0] || '?').toUpperCase()}
                                                                </div>
                                                                {u.displayName || 'Sin nombre'}
                                                            </td>
                                                            <td className="px-6 py-4">{u.email}</td>
                                                            <td className="px-6 py-4"><StatusBadge enabled={u.enabled} /></td>
                                                            <td className="px-6 py-4 text-right">
                                                                <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {filteredStudents.length === 0 && (
                                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No hay alumnos registrados.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── ORGANIZATION TAB ─────────────────────────────────── */}
                {activeTab === 'organization' && (
                    <ClassesCoursesSection user={user} students={allStudents} teachers={allTeachers} />
                )}

                {/* ── CUSTOMIZATION TAB ────────────────────────────────── */}
                {activeTab === 'customization' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <Palette className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personalización de la Institución</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2 text-sm">
                            Aquí podrás configurar el logo del centro, nombre institucional, colores de la interfaz y más ajustes de apariencia.
                        </p>
                        <span className="mt-4 inline-block px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">Próximamente</span>
                    </div>
                )}
            </main>

            {/* MODAL: AUTHORIZE TEACHER */}
            {showAddUserModal && (
                <Modal title="Autorizar Profesor" onClose={() => { setShowAddUserModal(false); setAddError(''); setAddSuccess(''); }}>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email del Profesor</label>
                            <input
                                type="email"
                                placeholder="ejemplo@escuela.com"
                                value={newUserEmail}
                                onChange={e => setNewUserEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1.5">Este email se añadirá a la lista blanca para permitir el registro como profesor.</p>
                        </div>
                        {addError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl flex items-center gap-2">
                                <XCircle className="w-4 h-4 shrink-0" /> {addError}
                            </div>
                        )}
                        {addSuccess && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-xl flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" /> {addSuccess}
                            </div>
                        )}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium text-sm transition-all">Cerrar</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex justify-center items-center gap-2">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Autorizar</>}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default SchoolAdminDashboard;