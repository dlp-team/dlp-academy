// src/pages/InstitutionAdminDashboard/InstitutionAdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, UserPlus, Search, CheckCircle2, XCircle,
    Palette, Loader2, Trash2, GraduationCap, BookOpen,
    LayoutGrid, Plus, FolderOpen, ChevronRight, Save, X
} from 'lucide-react';
import {
    collection, query, where, getDocs,
    addDoc, serverTimestamp, deleteDoc, doc, getDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../../components/layout/Header';
import InstitutionCustomizationView from './components/InstitutionCustomizationView';
import {
    HOME_THEME_DEFAULT_COLORS,
    HOME_THEME_TOKENS,
    getEffectiveHomeThemeColors,
    GLOBAL_BRAND_DEFAULTS,
    normalizeHexColor,
    resolveInstitutionBranding
} from '../../utils/themeTokens';

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

const DEFAULT_CUSTOMIZATION_FORM = {
    institutionDisplayName: '',
    logoUrl: '',
    primaryBrandColor: GLOBAL_BRAND_DEFAULTS.primaryColor,
    secondaryBrandColor: GLOBAL_BRAND_DEFAULTS.secondaryColor,
    tertiaryBrandColor: GLOBAL_BRAND_DEFAULTS.tertiaryColor,
    homeThemeColors: { ...HOME_THEME_DEFAULT_COLORS }
};

// ─── Classes & Courses Section ────────────────────────────────────────────────

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
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAll(); }, [user]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setCourseError('');
        if (!courseForm.name.trim()) { setCourseError('El nombre es obligatorio.'); return; }
        setCourseSubmitting(true);
        try {
            await addDoc(collection(db, 'courses'), {
                ...courseForm, institutionId: user.institutionId, createdBy: user.uid, createdAt: serverTimestamp(),
            });
            setShowCourseModal(false);
            setCourseForm({ name: '', description: '', color: '#6366f1' });
            fetchAll();
        } catch { setCourseError('Error al crear el curso.'); }
        finally { setCourseSubmitting(false); }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setClassError('');
        if (!classForm.name.trim()) { setClassError('El nombre es obligatorio.'); return; }
        setClassSubmitting(true);
        try {
            await addDoc(collection(db, 'classes'), {
                ...classForm, institutionId: user.institutionId, createdBy: user.uid, createdAt: serverTimestamp(),
            });
            setShowClassModal(false);
            setClassForm({ name: '', courseId: '', teacherId: '', studentIds: [] });
            fetchAll();
        } catch { setClassError('Error al crear la clase.'); }
        finally { setClassSubmitting(false); }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm('¿Eliminar este curso?')) return;
        await deleteDoc(doc(db, 'courses', id)); fetchAll();
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm('¿Eliminar esta clase?')) return;
        await deleteDoc(doc(db, 'classes', id)); fetchAll();
    };

    const toggleStudent = (id) => setClassForm(p => ({
        ...p, studentIds: p.studentIds.includes(id) ? p.studentIds.filter(s => s !== id) : [...p.studentIds, id],
    }));

    const getCourseName = (id) => courses.find(c => c.id === id)?.name || '—';
    const getTeacherName = (id) => { const t = allTeachers.find(t => t.id === id); return t ? (t.displayName || t.email) : '—'; };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sub-tab bar */}
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
                    onClick={() => view === 'courses' ? setShowCourseModal(true) : setShowClassModal(true)}
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
                    {/* COURSES */}
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

                    {/* CLASSES */}
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

            {/* MODAL: CREATE COURSE */}
            {showCourseModal && (
                <Modal title="Crear Curso" onClose={() => { setShowCourseModal(false); setCourseError(''); }}>
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre del Curso *</label>
                            <input type="text" placeholder="Ej: Bachillerato 2025" value={courseForm.name}
                                onChange={e => setCourseForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                            <textarea placeholder="Descripción opcional..." value={courseForm.description} rows={2}
                                onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm resize-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {COLORS.map(c => (
                                    <button key={c} type="button" onClick={() => setCourseForm(p => ({ ...p, color: c }))}
                                        className={`w-7 h-7 rounded-full transition-all ${courseForm.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                                        style={{ backgroundColor: c }} />
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

            {/* MODAL: CREATE CLASS */}
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
                                <input type="text" placeholder="Ej: 1º ESO – Grupo A" value={classForm.name}
                                    onChange={e => setClassForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Curso (opcional)</label>
                                <select value={classForm.courseId} onChange={e => setClassForm(p => ({ ...p, courseId: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                    <option value="">Sin curso asignado</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profesor responsable</label>
                                <select value={classForm.teacherId} onChange={e => setClassForm(p => ({ ...p, teacherId: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
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
                                                <input type="checkbox" checked={classForm.studentIds.includes(s.id)}
                                                    onChange={() => toggleStudent(s.id)} className="rounded text-indigo-600" />
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

// ─── Main Component ───────────────────────────────────────────────────────────

const InstitutionAdminDashboard = ({ user }) => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('users');
    const [userType, setUserType] = useState('teachers');

    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [allowedTeachers, setAllowedTeachers] = useState([]);

    // Full lists for Classes section (always loaded)
    const [allTeachers, setAllTeachers] = useState([]);
    const [allStudents, setAllStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');
    const [institutionName, setInstitutionName] = useState('');
    const [customizationForm, setCustomizationForm] = useState(DEFAULT_CUSTOMIZATION_FORM);
    const [customizationLoading, setCustomizationLoading] = useState(false);
    const [customizationSaving, setCustomizationSaving] = useState(false);
    const [customizationError, setCustomizationError] = useState('');
    const [customizationSuccess, setCustomizationSuccess] = useState('');

    useEffect(() => {
        if (user && user.role !== 'institutionadmin') {
            console.warn('Unauthorized access attempt to Institution Admin Dashboard');
            navigate('/home');
        }
    }, [user, navigate]);

    const fetchData = async () => {
        if (!user?.institutionId) return;
        setLoading(true);
        try {
            if (userType === 'teachers') {
                const [teachersSnap, allowedSnap] = await Promise.all([
                    getDocs(query(collection(db, 'users'), where('institutionId', '==', user.institutionId), where('role', '==', 'teacher'))),
                    getDocs(query(collection(db, 'allowed_teachers'), where('institutionId', '==', user.institutionId))),
                ]);
                setTeachers(teachersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setAllowedTeachers(allowedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setStudents([]);
            } else {
                const studentsSnap = await getDocs(query(collection(db, 'users'), where('institutionId', '==', user.institutionId), where('role', '==', 'student')));
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

    useEffect(() => {
        let active = true;

        const fetchInstitutionCustomization = async () => {
            if (!user?.institutionId) return;
            setCustomizationLoading(true);
            try {
                const institutionRef = doc(db, 'institutions', user.institutionId);
                const institutionSnap = await getDoc(institutionRef);

                if (!active || !institutionSnap.exists()) return;

                const institutionData = institutionSnap.data() || {};
                const customizationData = institutionData.customization || {};
                const branding = resolveInstitutionBranding(institutionData);
                const resolvedColors = getEffectiveHomeThemeColors(
                    customizationData.homeThemeColors || customizationData.home?.colors || null
                );

                setInstitutionName(institutionData.name || '');
                setCustomizationForm({
                    institutionDisplayName: branding.institutionDisplayName || institutionData.name || '',
                    logoUrl: branding.logoUrl || '',
                    primaryBrandColor: branding.primaryColor || GLOBAL_BRAND_DEFAULTS.primaryColor,
                    secondaryBrandColor: branding.secondaryColor || GLOBAL_BRAND_DEFAULTS.secondaryColor,
                    tertiaryBrandColor: branding.tertiaryColor || GLOBAL_BRAND_DEFAULTS.tertiaryColor,
                    homeThemeColors: resolvedColors
                });
            } catch (error) {
                console.error('Error loading institution customization:', error);
                if (active) {
                    setCustomizationError('No se pudo cargar la personalización de la institución.');
                }
            } finally {
                if (active) setCustomizationLoading(false);
            }
        };

        fetchInstitutionCustomization();

        return () => {
            active = false;
        };
    }, [user?.institutionId]);

    // Always keep full lists for ClassesCoursesSection
    useEffect(() => {
        if (!user?.institutionId) return;
        Promise.all([
            getDocs(query(collection(db, 'users'), where('institutionId', '==', user.institutionId), where('role', '==', 'teacher'))),
            getDocs(query(collection(db, 'users'), where('institutionId', '==', user.institutionId), where('role', '==', 'student'))),
        ]).then(([tSnap, sSnap]) => {
            setAllTeachers(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            setAllStudents(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
    }, [user]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddError(''); setAddSuccess(''); setIsSubmitting(true);
        if (!newUserEmail.includes('@')) { setAddError('Por favor introduce un email válido.'); setIsSubmitting(false); return; }
        try {
            const checkSnap = await getDocs(query(collection(db, 'allowed_teachers'), where('email', '==', newUserEmail), where('institutionId', '==', user.institutionId)));
            if (!checkSnap.empty) { setAddError('Este email ya está en la lista de profesores autorizados.'); setIsSubmitting(false); return; }
            await addDoc(collection(db, 'allowed_teachers'), {
                email: newUserEmail.toLowerCase().trim(),
                institutionId: user.institutionId,
                addedBy: user.uid,
                createdAt: serverTimestamp(),
                enabled: true,
            });
            setAddSuccess(`Acceso concedido a ${newUserEmail}`);
            setNewUserEmail('');
            fetchData();
        } catch (error) {
            console.error(error);
            setAddError('Error al guardar en la base de datos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveAccess = async (docId) => {
        if (!window.confirm('¿Seguro que quieres eliminar el acceso a este profesor?')) return;
        try {
            await deleteDoc(doc(db, 'allowed_teachers', docId));
            fetchData();
        } catch (error) { console.error('Error removing access', error); }
    };

    const handleSaveCustomization = async (incomingFormValues = null) => {
        if (!user?.institutionId) return;

        const nextCustomizationForm = incomingFormValues
            ? {
                institutionDisplayName: incomingFormValues.institutionName || '',
                logoUrl: incomingFormValues.logoUrl || '',
                primaryBrandColor: incomingFormValues.primary || GLOBAL_BRAND_DEFAULTS.primaryColor,
                secondaryBrandColor: incomingFormValues.secondary || GLOBAL_BRAND_DEFAULTS.secondaryColor,
                tertiaryBrandColor: incomingFormValues.accent || GLOBAL_BRAND_DEFAULTS.tertiaryColor,
                homeThemeColors: getEffectiveHomeThemeColors({
                    primary: incomingFormValues.primary,
                    secondary: incomingFormValues.secondary,
                    accent: incomingFormValues.accent,
                    mutedText: HOME_THEME_DEFAULT_COLORS.mutedText,
                    cardBorder: incomingFormValues.cardBorder,
                    cardBackground: HOME_THEME_DEFAULT_COLORS.cardBackground
                })
            }
            : customizationForm;

        setCustomizationError('');
        setCustomizationSuccess('');
        setCustomizationSaving(true);

        try {
            const institutionRef = doc(db, 'institutions', user.institutionId);
            const resolvedColors = getEffectiveHomeThemeColors(nextCustomizationForm.homeThemeColors);
            const normalizedPrimaryBrandColor = normalizeHexColor(nextCustomizationForm.primaryBrandColor) || GLOBAL_BRAND_DEFAULTS.primaryColor;
            const normalizedSecondaryBrandColor = normalizeHexColor(nextCustomizationForm.secondaryBrandColor) || GLOBAL_BRAND_DEFAULTS.secondaryColor;
            const normalizedTertiaryBrandColor = normalizeHexColor(nextCustomizationForm.tertiaryBrandColor) || GLOBAL_BRAND_DEFAULTS.tertiaryColor;

            await updateDoc(institutionRef, {
                'customization.institutionDisplayName': nextCustomizationForm.institutionDisplayName.trim() || institutionName || '',
                'customization.logoUrl': nextCustomizationForm.logoUrl.trim(),
                'customization.primaryBrandColor': normalizedPrimaryBrandColor,
                'customization.secondaryBrandColor': normalizedSecondaryBrandColor,
                'customization.tertiaryBrandColor': normalizedTertiaryBrandColor,
                'customization.brand.primaryColor': normalizedPrimaryBrandColor,
                'customization.brand.secondaryColor': normalizedSecondaryBrandColor,
                'customization.brand.tertiaryColor': normalizedTertiaryBrandColor,
                'customization.homeThemeColors': resolvedColors,
                'customization.home.colors': resolvedColors,
                'customization.homeThemeTokens': HOME_THEME_TOKENS,
                'customization.home.tokens': HOME_THEME_TOKENS,
                updatedAt: serverTimestamp()
            });

            setCustomizationForm(nextCustomizationForm);
            setCustomizationSuccess('Personalización guardada correctamente.');
        } catch (error) {
            console.error('Error saving customization:', error);
            setCustomizationError('No se pudieron guardar los cambios. Inténtalo de nuevo.');
            throw error;
        } finally {
            setCustomizationSaving(false);
        }
    };

    const customizationInitialValues = {
        institutionName: customizationForm.institutionDisplayName || institutionName || '',
        logoUrl: customizationForm.logoUrl || '',
        primary: customizationForm.primaryBrandColor || customizationForm.homeThemeColors?.primary || HOME_THEME_DEFAULT_COLORS.primary,
        secondary: customizationForm.secondaryBrandColor || customizationForm.homeThemeColors?.secondary || GLOBAL_BRAND_DEFAULTS.secondaryColor,
        accent: customizationForm.tertiaryBrandColor || customizationForm.homeThemeColors?.accent || GLOBAL_BRAND_DEFAULTS.tertiaryColor,
        mutedText: HOME_THEME_DEFAULT_COLORS.mutedText,
        cardBorder: customizationForm.homeThemeColors?.cardBorder || HOME_THEME_DEFAULT_COLORS.cardBorder,
        cardBackground: HOME_THEME_DEFAULT_COLORS.cardBackground
    };

    const TABS = [
        { key: 'users',         label: 'Usuarios',        icon: Users },
        { key: 'organization',  label: 'Cursos y Clases',  icon: LayoutGrid },
        { key: 'customization', label: 'Personalización',  icon: Palette },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Page header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel de Administración</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {user?.institutionId ? `Institución ID: ${user.institutionId}` : 'Configuración de Institución'}
                        </p>
                    </div>
                    {activeTab === 'users' && userType === 'teachers' && (
                        <button
                            onClick={() => { setAddError(''); setAddSuccess(''); setShowAddUserModal(true); }}
                            className="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-[var(--color-primary-200)] dark:shadow-[var(--color-primary-900)/0.2] transition-all active:scale-95"
                        >
                            <UserPlus className="w-5 h-5" /> Autorizar Profesor
                        </button>
                    )}
                </div>

                {/* Underline tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 -mb-px transition-colors ${
                                activeTab === key
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {/* ── USERS TAB ── */}
                {activeTab === 'users' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Filter bar */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between">
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                                <button
                                    onClick={() => { setUserType('teachers'); setSearchTerm(''); }}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                                        userType === 'teachers' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <BookOpen className="w-4 h-4" /> Profesores
                                </button>
                                <button
                                    onClick={() => { setUserType('students'); setSearchTerm(''); }}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                                        userType === 'students' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <GraduationCap className="w-4 h-4" /> Alumnos
                                </button>
                            </div>
                            <div className="relative flex-1 md:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por email..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
                        ) : (
                            <div className="space-y-6">
                                {/* TEACHERS */}
                                {userType === 'teachers' && (
                                    <>
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Profesores Registrados
                                                </h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                                        <tr>
                                                            <th className="px-6 py-4">Usuario</th>
                                                            <th className="px-6 py-4">Email</th>
                                                            <th className="px-6 py-4">Estado</th>
                                                            <th className="px-6 py-4 w-10"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {teachers.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                                                            <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate(`/institution-admin-dashboard/teacher/${u.id}`)}>
                                                                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.displayName || 'Sin Nombre'}</td>
                                                                <td className="px-6 py-4">{u.email}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.enabled !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                        {u.enabled !== false ? 'Activo' : 'Deshabilitado'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right"><ChevronRight className="w-4 h-4 text-slate-300 ml-auto" /></td>
                                                            </tr>
                                                        ))}
                                                        {teachers.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No hay profesores registrados aún.</td></tr>}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
                                                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <UserPlus className="w-4 h-4 text-indigo-500" /> Profesores Invitados (Lista Blanca)
                                                </h3>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {allowedTeachers.map(t => (
                                                            <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                                <td className="px-6 py-4 font-medium">{t.email}</td>
                                                                <td className="px-6 py-4 w-32 text-right">
                                                                    <button onClick={() => handleRemoveAccess(t.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Revocar acceso">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {allowedTeachers.length === 0 && (
                                                            <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400">No has autorizado a ningún profesor extra aún.</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* STUDENTS */}
                                {userType === 'students' && (
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-blue-500" /> Alumnos Registrados
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                                    <tr>
                                                        <th className="px-6 py-4">Usuario</th>
                                                        <th className="px-6 py-4">Email</th>
                                                        <th className="px-6 py-4">Estado</th>
                                                        <th className="px-6 py-4 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {students.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => navigate(`/institution-admin-dashboard/student/${u.id}`)}>
                                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.displayName || 'Sin Nombre'}</td>
                                                            <td className="px-6 py-4">{u.email}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Activo</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right"><ChevronRight className="w-4 h-4 text-slate-300 ml-auto" /></td>
                                                        </tr>
                                                    ))}
                                                    {students.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No hay alumnos registrados aún.</td></tr>}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── ORGANIZATION TAB ── */}
                {activeTab === 'organization' && (
                    <ClassesCoursesSection user={user} allStudents={allStudents} allTeachers={allTeachers} />
                )}

                {/* ── CUSTOMIZATION TAB ── */}
                {activeTab === 'customization' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {customizationLoading ? (
                            <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
                        ) : (
                            <div className="space-y-4">
                                {customizationError && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
                                        <XCircle className="w-4 h-4" /> {customizationError}
                                    </div>
                                )}
                                {customizationSuccess && (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 text-sm rounded-lg flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> {customizationSuccess}
                                    </div>
                                )}

                                <div className="h-[calc(100vh-13rem)] min-h-[720px]">
                                    <InstitutionCustomizationView
                                        className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                                        initialValues={customizationInitialValues}
                                        onSave={handleSaveCustomization}
                                    />
                                </div>

                                {customizationSaving && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Guardando personalización...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* MODAL: AUTHORIZE TEACHER */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Autorizar Profesor</h3>
                            <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleAddUser}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email del Profesor</label>
                                <input type="email" placeholder="ejemplo@escuela.com" value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    required />
                                <p className="text-xs text-gray-500 mt-2">Este email se añadirá a la lista blanca para permitir el registro.</p>
                            </div>
                            {addError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><XCircle className="w-4 h-4" /> {addError}</div>}
                            {addSuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {addSuccess}</div>}
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddUserModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all">Cerrar</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex justify-center items-center gap-2">
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" /><span>Autorizar</span></>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstitutionAdminDashboard;