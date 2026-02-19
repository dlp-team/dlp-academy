// src/pages/TeacherDashboard/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Search, CheckCircle2, BookOpen,
    GraduationCap, Loader2, ChevronRight,
    LayoutGrid, TrendingUp, Calendar, Clock,
    BarChart3, FolderOpen
} from 'lucide-react';
import {
    collection, query, where, getDocs, doc, getDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../../components/layout/Header';

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab = ({ classes, students, loading }) => {
    const cards = [
        { label: 'Mis Clases',    value: classes.length,  icon: LayoutGrid,    bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-600' },
        { label: 'Mis Alumnos',   value: students.length, icon: GraduationCap, bg: 'bg-blue-50   dark:bg-blue-900/20',   color: 'text-blue-600'   },
        { label: 'Asignaturas',   value: '—',             icon: BookOpen,      bg: 'bg-emerald-50 dark:bg-emerald-900/20',color: 'text-emerald-600'},
        { label: 'Progreso Medio',value: '—',             icon: TrendingUp,    bg: 'bg-amber-50  dark:bg-amber-900/20',  color: 'text-amber-600'  },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map(({ label, value, icon: Icon, bg, color }) => (
                    <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-0.5">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : value}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
                    </div>
                ))}
            </div>

            {/* Classes quick view */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-indigo-500" /> Mis Clases
                    </h3>
                </div>
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
                ) : classes.length === 0 ? (
                    <div className="px-6 py-10 text-center text-slate-400">No tienes clases asignadas todavía.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {classes.map(cl => (
                            <div key={cl.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{cl.name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{cl.studentIds?.length || 0} alumno(s)</p>
                                </div>
                                <span className="text-xs text-slate-400">{cl.courseName || ''}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Activity placeholder */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center py-14">
                <BarChart3 className="w-14 h-14 text-slate-200 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Estadísticas Detalladas</h3>
                <p className="text-slate-500 max-w-sm text-sm">El progreso individual por alumno y asignatura estará disponible próximamente.</p>
                <span className="mt-4 inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full text-xs font-medium">Próximamente</span>
            </div>
        </div>
    );
};

// ─── My Classes Tab ───────────────────────────────────────────────────────────

const MyClassesTab = ({ classes, allStudents, loading }) => {
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');

    const selectedClass = classes.find(c => c.id === selected);
    const classStudents = selectedClass
        ? allStudents.filter(s => selectedClass.studentIds?.includes(s.id))
        : [];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
            ) : classes.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                    <LayoutGrid className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">No tienes clases asignadas. El administrador de tu escuela debe asignarte una.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Class list */}
                    <div className="lg:col-span-1 space-y-3">
                        {classes.map(cl => (
                            <button key={cl.id} onClick={() => { setSelected(cl.id); setSearch(''); }}
                                className={`w-full text-left bg-white dark:bg-slate-900 rounded-2xl shadow-sm border p-4 transition-all ${
                                    selected === cl.id
                                        ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-900'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-700'
                                }`}>
                                <p className="font-semibold text-slate-900 dark:text-white mb-0.5">{cl.name}</p>
                                <p className="text-xs text-slate-400">{cl.studentIds?.length || 0} alumno(s) · {cl.courseName || 'Sin curso'}</p>
                            </button>
                        ))}
                    </div>

                    {/* Student list for selected class */}
                    <div className="lg:col-span-2">
                        {!selected ? (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center h-full flex flex-col items-center justify-center">
                                <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="text-slate-400 text-sm">Selecciona una clase para ver sus alumnos.</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between gap-4">
                                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-blue-500" />
                                        {selectedClass?.name} — Alumnos
                                    </h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                        <input type="text" placeholder="Buscar..." value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-400" />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                            <tr>
                                                <th className="px-6 py-4">Alumno</th>
                                                <th className="px-6 py-4">Email</th>
                                                <th className="px-6 py-4">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {classStudents
                                                .filter(s => s.displayName?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()))
                                                .map(s => (
                                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{s.displayName || 'Sin nombre'}</td>
                                                        <td className="px-6 py-4">{s.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.enabled !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                                {s.enabled !== false ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                            {classStudents.length === 0 && (
                                                <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">Esta clase no tiene alumnos asignados.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── My Students Tab ──────────────────────────────────────────────────────────

const MyStudentsTab = ({ allStudents, loading }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const filtered = allStudents.filter(s =>
        s.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex gap-4 justify-between">
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar alumno..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <span className="text-sm text-slate-400 self-center">{filtered.length} alumno(s)</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Alumno</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Último acceso</th>
                                    <th className="px-6 py-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400">No se encontraron alumnos.</td></tr>
                                ) : filtered.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                        onClick={() => navigate(`/teacher-dashboard/student/${s.id}`)}>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{s.displayName || 'Sin nombre'}</td>
                                        <td className="px-6 py-4">{s.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.enabled !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {s.enabled !== false ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {s.lastLogin ? new Date(s.lastLogin.toDate()).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TeacherDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const [myClasses, setMyClasses] = useState([]);
    const [allStudents, setAllStudents] = useState([]); // students across all my classes
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'teacher') {
            console.warn('Unauthorized access to Teacher Dashboard');
            navigate('/home');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.uid || !user?.schoolId) return;
            setLoading(true);
            try {
                // 1. Fetch classes where this teacher is assigned
                const classesSnap = await getDocs(
                    query(collection(db, 'classes'),
                        where('schoolId', '==', user.schoolId),
                        where('teacherId', '==', user.uid)
                    )
                );
                const classes = classesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                // 2. Enrich with course names
                const courseIds = [...new Set(classes.map(c => c.courseId).filter(Boolean))];
                const courseNames = {};
                await Promise.all(courseIds.map(async id => {
                    const snap = await getDoc(doc(db, 'courses', id));
                    if (snap.exists()) courseNames[id] = snap.data().name;
                }));
                const enrichedClasses = classes.map(c => ({ ...c, courseName: courseNames[c.courseId] || '' }));

                // 3. Collect all unique student IDs across classes
                const studentIdSet = new Set();
                enrichedClasses.forEach(c => (c.studentIds || []).forEach(id => studentIdSet.add(id)));

                // 4. Fetch student user docs
                let students = [];
                if (studentIdSet.size > 0) {
                    const studentsSnap = await getDocs(
                        query(collection(db, 'users'),
                            where('schoolId', '==', user.schoolId),
                            where('role', '==', 'student')
                        )
                    );
                    students = studentsSnap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(s => studentIdSet.has(s.id));
                }

                setMyClasses(enrichedClasses);
                setAllStudents(students);
            } catch (e) {
                console.error('Error fetching teacher data:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const TABS = [
        { key: 'overview', label: 'Resumen',      icon: BarChart3    },
        { key: 'classes',  label: 'Mis Clases',   icon: LayoutGrid   },
        { key: 'students', label: 'Mis Alumnos',  icon: GraduationCap},
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Page header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel del Profesor</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Bienvenido, {user?.displayName || user?.email}. Aquí tienes un resumen de tus clases y alumnos.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium">
                        <BookOpen className="w-4 h-4" />
                        {myClasses.length} clase(s) asignada(s)
                    </div>
                </div>

                {/* Underline tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 -mb-px transition-colors ${
                                activeTab === key
                                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}>
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && <OverviewTab classes={myClasses} students={allStudents} loading={loading} />}
                {activeTab === 'classes'  && <MyClassesTab classes={myClasses} allStudents={allStudents} loading={loading} />}
                {activeTab === 'students' && <MyStudentsTab allStudents={allStudents} loading={loading} />}
            </main>
        </div>
    );
};

export default TeacherDashboard;