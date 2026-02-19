// src/pages/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, Users, Search, CheckCircle2, XCircle,
    Loader2, Trash2, BookOpen, GraduationCap,
    Plus, ChevronRight, ToggleLeft, ToggleRight,
    ShieldAlert, Globe, BarChart3
} from 'lucide-react';
import {
    collection, query, where, getDocs,
    addDoc, serverTimestamp, deleteDoc, doc, updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../../components/layout/Header';

// ─── Shared helpers ───────────────────────────────────────────────────────────

const RoleBadge = ({ role }) => {
    const map = {
        admin:       { label: 'Admin Global',  cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
        schooladmin: { label: 'Admin Escuela', cls: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400'  },
        teacher:     { label: 'Profesor',      cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
        student:     { label: 'Alumno',        cls: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400'   },
    };
    const cfg = map[role] || { label: role, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────

const OverviewTab = ({ stats, loading }) => {
    const cards = [
        { label: 'Instituciones',  value: stats.schools,  icon: Building2,    color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { label: 'Profesores',     value: stats.teachers, icon: BookOpen,     color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Alumnos',        value: stats.students, icon: GraduationCap,color: 'text-blue-600',   bg: 'bg-blue-50   dark:bg-blue-900/20'   },
        { label: 'Total Usuarios', value: stats.total,    icon: Users,        color: 'text-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20'},
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white mb-0.5">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-300" /> : (value ?? '—')}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center py-16">
                <BarChart3 className="w-14 h-14 text-slate-200 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Gráficas de Actividad</h3>
                <p className="text-slate-500 max-w-sm text-sm">Los reportes de actividad por institución estarán disponibles próximamente.</p>
                <span className="mt-4 inline-block px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-full text-xs font-medium">Próximamente</span>
            </div>
        </div>
    );
};

// ─── Schools Tab ──────────────────────────────────────────────────────────────

const SchoolsTab = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', adminEmail: '', city: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'schools'));
            setSchools(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchSchools(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(''); setSuccess(''); setSubmitting(true);
        if (!form.name.trim()) { setError('El nombre es obligatorio.'); setSubmitting(false); return; }
        try {
            await addDoc(collection(db, 'schools'), {
                name: form.name.trim(),
                adminEmail: form.adminEmail.toLowerCase().trim(),
                city: form.city.trim(),
                enabled: true,
                createdAt: serverTimestamp(),
            });
            setSuccess(`Institución "${form.name}" creada correctamente.`);
            setForm({ name: '', adminEmail: '', city: '' });
            fetchSchools();
        } catch { setError('Error al crear la institución.'); }
        finally { setSubmitting(false); }
    };

    const handleToggle = async (school) => {
        if (!window.confirm(`¿${school.enabled !== false ? 'Deshabilitar' : 'Habilitar'} "${school.name}"?`)) return;
        await updateDoc(doc(db, 'schools', school.id), { enabled: !school.enabled });
        fetchSchools();
    };

    const handleDelete = async (school) => {
        if (!window.confirm(`¿Eliminar "${school.name}"? Esta acción no elimina los usuarios asociados.`)) return;
        await deleteDoc(doc(db, 'schools', school.id));
        fetchSchools();
    };

    const filtered = schools.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.city?.toLowerCase().includes(search.toLowerCase()) ||
        s.adminEmail?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar institución..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button
                    onClick={() => { setError(''); setSuccess(''); setShowModal(true); }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-purple-200 dark:shadow-purple-900/20 transition-all active:scale-95 text-sm"
                >
                    <Plus className="w-4 h-4" /> Nueva Institución
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-purple-500" /></div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-500" /> Instituciones Registradas ({filtered.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Institución</th>
                                    <th className="px-6 py-4">Ciudad</th>
                                    <th className="px-6 py-4">Admin</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400">No hay instituciones registradas.</td></tr>
                                ) : filtered.map(school => (
                                    <tr key={school.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${school.enabled === false ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{school.name}</td>
                                        <td className="px-6 py-4">{school.city || '—'}</td>
                                        <td className="px-6 py-4">{school.adminEmail || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${school.enabled !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {school.enabled !== false ? 'Activa' : 'Deshabilitada'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleToggle(school)} title={school.enabled !== false ? 'Deshabilitar' : 'Habilitar'}
                                                    className="text-slate-400 hover:text-amber-500 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                                    {school.enabled !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => handleDelete(school)} title="Eliminar"
                                                    className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL: CREATE SCHOOL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nueva Institución</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
                                <input type="text" placeholder="Ej: IES Ramón y Cajal" value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ciudad</label>
                                <input type="text" placeholder="Ej: Madrid" value={form.city}
                                    onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email del Admin de Escuela</label>
                                <input type="email" placeholder="admin@escuela.com" value={form.adminEmail}
                                    onChange={e => setForm(p => ({ ...p, adminEmail: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
                                <p className="text-xs text-gray-500 mt-2">Referencia para saber quién gestiona la institución.</p>
                            </div>
                            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><XCircle className="w-4 h-4" /> {error}</div>}
                            {success && <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {success}</div>}
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all">Cerrar</button>
                                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg shadow-purple-200 dark:shadow-purple-900/20 transition-all flex justify-center items-center gap-2">
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /><span>Crear</span></>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────

const UsersTab = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, 'users'));
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleToggle = async (u) => {
        if (!window.confirm(`¿${u.enabled !== false ? 'Deshabilitar' : 'Habilitar'} a ${u.email}?`)) return;
        await updateDoc(doc(db, 'users', u.id), { enabled: !(u.enabled !== false) });
        fetchUsers();
    };

    const handleRoleChange = async (u, newRole) => {
        if (!window.confirm(`¿Cambiar rol de ${u.email} a "${newRole}"?`)) return;
        await updateDoc(doc(db, 'users', u.id), { role: newRole });
        fetchUsers();
    };

    const ROLES = ['all', 'admin', 'schooladmin', 'teacher', 'student'];

    const filtered = users.filter(u => {
        const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase()) ||
                            u.displayName?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit flex-wrap gap-1">
                    {ROLES.map(r => (
                        <button key={r} onClick={() => setRoleFilter(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                                roleFilter === r ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}>
                            {r === 'all' ? 'Todos' : r === 'schooladmin' ? 'Admin Esc.' : r.charAt(0).toUpperCase() + r.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Buscar por nombre o email..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-purple-500" /></div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" /> Todos los Usuarios ({filtered.length})
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Cambiar Rol</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-400">No se encontraron usuarios.</td></tr>
                                ) : filtered.map(u => (
                                    <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${u.enabled === false ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.displayName || 'Sin nombre'}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                        <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.enabled !== false ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {u.enabled !== false ? 'Activo' : 'Deshabilitado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select value={u.role || ''} onChange={e => handleRoleChange(u, e.target.value)}
                                                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-purple-400">
                                                <option value="student">Alumno</option>
                                                <option value="teacher">Profesor</option>
                                                <option value="schooladmin">Admin Escuela</option>
                                                <option value="admin">Admin Global</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleToggle(u)} title={u.enabled !== false ? 'Deshabilitar' : 'Habilitar'}
                                                className="text-slate-400 hover:text-amber-500 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors">
                                                {u.enabled !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                            </button>
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

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ schools: null, teachers: null, students: null, total: null });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            console.warn('Unauthorized access to Admin Dashboard');
            navigate('/home');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                const [schoolsSnap, teachersSnap, studentsSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'schools')),
                    getDocs(query(collection(db, 'users'), where('role', '==', 'teacher'))),
                    getDocs(query(collection(db, 'users'), where('role', '==', 'student'))),
                    getDocs(collection(db, 'users')),
                ]);
                setStats({
                    schools:  schoolsSnap.size,
                    teachers: teachersSnap.size,
                    students: studentsSnap.size,
                    total:    usersSnap.size,
                });
            } catch (e) { console.error(e); }
            finally { setStatsLoading(false); }
        };
        fetchStats();
    }, []);

    const TABS = [
        { key: 'overview', label: 'Resumen',        icon: BarChart3   },
        { key: 'schools',  label: 'Instituciones',  icon: Building2   },
        { key: 'users',    label: 'Usuarios',       icon: Users       },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Page header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel de Administración Global</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Gestiona todas las instituciones y usuarios de la plataforma.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-medium">
                        <ShieldAlert className="w-4 h-4" /> Acceso de Admin Global
                    </div>
                </div>

                {/* Underline tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key)}
                            className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 -mb-px transition-colors ${
                                activeTab === key
                                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                            }`}>
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && <OverviewTab stats={stats} loading={statsLoading} />}
                {activeTab === 'schools'  && <SchoolsTab />}
                {activeTab === 'users'    && <UsersTab />}
            </main>
        </div>
    );
};

export default AdminDashboard;