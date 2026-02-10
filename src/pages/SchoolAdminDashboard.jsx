import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, UserPlus, Search, CheckCircle2, XCircle, 
    Palette, Loader2, Trash2, GraduationCap, BookOpen
} from 'lucide-react';
import { 
    collection, query, where, getDocs, 
    addDoc, serverTimestamp, deleteDoc, doc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/layout/Header';

const SchoolAdminDashboard = ({ user }) => {
    const navigate = useNavigate();

    // --- State ---
    const [activeTab, setActiveTab] = useState('users'); 
    const [userType, setUserType] = useState('teachers'); // 'teachers' or 'students'
    
    // Separated Data Lists to prevent mixing
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [allowedTeachers, setAllowedTeachers] = useState([]); // Whitelist
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');

    // --- 1. MANUAL SECURITY CHECK (Preserved) ---
    useEffect(() => {
        if (user && user.role !== 'schooladmin') {
            console.warn("Unauthorized access attempt to School Admin Dashboard");
            navigate('/home');
        }
    }, [user, navigate]);

    // --- 2. FETCH DATA ---
    const fetchData = async () => {
        if (!user?.schoolId) return;

        setLoading(true);
        try {
            if (userType === 'teachers') {
                // A. Fetch Active Teachers
                const teachersQuery = query(
                    collection(db, 'users'),
                    where('schoolId', '==', user.schoolId),
                    where('role', '==', 'teacher')
                );
                const teachersSnap = await getDocs(teachersQuery);
                setTeachers(teachersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

                // B. Fetch Whitelist (Only for teachers)
                const allowedQuery = query(
                    collection(db, 'allowed_teachers'),
                    where('schoolId', '==', user.schoolId)
                );
                const allowedSnap = await getDocs(allowedQuery);
                setAllowedTeachers(allowedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                
                // Clear students to ensure no crossover
                setStudents([]);

            } else {
                // C. Fetch Active Students
                const studentsQuery = query(
                    collection(db, 'users'),
                    where('schoolId', '==', user.schoolId),
                    where('role', '==', 'student')
                );
                const studentsSnap = await getDocs(studentsQuery);
                setStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                
                // Clear teachers data
                setTeachers([]);
                setAllowedTeachers([]);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when tab or user type changes
    useEffect(() => {
        fetchData();
    }, [user, userType]);


    // --- 3. ACTIONS ---
    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddError('');
        setAddSuccess('');
        setIsSubmitting(true);

        if (!newUserEmail.includes('@')) {
            setAddError('Por favor introduce un email válido.');
            setIsSubmitting(false);
            return;
        }

        try {
            const checkQuery = query(
                collection(db, 'allowed_teachers'),
                where('email', '==', newUserEmail),
                where('schoolId', '==', user.schoolId)
            );
            const checkSnap = await getDocs(checkQuery);

            if (!checkSnap.empty) {
                setAddError('Este email ya está en la lista de profesores autorizados.');
                setIsSubmitting(false);
                return;
            }

            await addDoc(collection(db, 'allowed_teachers'), {
                email: newUserEmail.toLowerCase().trim(),
                schoolId: user.schoolId,
                addedBy: user.uid,
                createdAt: serverTimestamp(),
                enabled: true
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
        if(!window.confirm("¿Seguro que quieres eliminar el acceso a este profesor?")) return;
        try {
            await deleteDoc(doc(db, 'allowed_teachers', docId));
            fetchData();
        } catch(error) {
            console.error("Error removing access", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
            <Header user={user} />
            
            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                            Panel de Administración
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            {user?.schoolId ? `Escuela ID: ${user.schoolId}` : 'Configuración de Escuela'}
                        </p>
                    </div>
                    
                    {/* Only show "Authorize Teacher" button when in Teachers Tab */}
                    {activeTab === 'users' && userType === 'teachers' && (
                        <button 
                            onClick={() => {
                                setAddError(''); 
                                setAddSuccess(''); 
                                setShowAddUserModal(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all active:scale-95"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Autorizar Profesor</span>
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'users'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                    >
                        <Users className="w-4 h-4" /> Usuarios
                    </button>
                    <button
                        onClick={() => setActiveTab('customization')}
                        className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === 'customization'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                    >
                        <Palette className="w-4 h-4" /> Personalización
                    </button>
                </div>

                {/* CONTENT: USERS TAB */}
                {activeTab === 'users' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Filters */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between">
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                                <button
                                    onClick={() => setUserType('teachers')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                                        userType === 'teachers' 
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <BookOpen className="w-4 h-4" /> Profesores
                                </button>
                                <button
                                    onClick={() => setUserType('students')}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                                        userType === 'students' 
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    <GraduationCap className="w-4 h-4" /> Alumnos
                                </button>
                            </div>

                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* TABLE SECTION */}
                        <div className="space-y-6">
                            
                            {/* --- TEACHERS VIEW --- */}
                            {userType === 'teachers' && (
                                <>
                                    {/* 1. REGISTERED TEACHERS */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                Profesores Registrados
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                                    <tr>
                                                        <th className="px-6 py-4">Usuario</th>
                                                        <th className="px-6 py-4">Email</th>
                                                        <th className="px-6 py-4">Estado</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {teachers
                                                        .filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                                                        .map((u) => (
                                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                                {u.displayName || 'Sin Nombre'}
                                                            </td>
                                                            <td className="px-6 py-4">{u.email}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                    Activo
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {teachers.length === 0 && !loading && (
                                                        <tr>
                                                            <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                                                                No hay profesores registrados aún.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 2. WHITELIST (ALLOWED TEACHERS) */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
                                            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                                <UserPlus className="w-4 h-4 text-indigo-500" />
                                                Profesores Invitados (Lista Blanca)
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {allowedTeachers.map((t) => (
                                                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                            <td className="px-6 py-4 font-medium">{t.email}</td>
                                                            <td className="px-6 py-4 w-32 text-right">
                                                                <button 
                                                                    onClick={() => handleRemoveAccess(t.id)}
                                                                    className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Revocar acceso"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {allowedTeachers.length === 0 && !loading && (
                                                        <tr>
                                                            <td colSpan="2" className="px-6 py-8 text-center text-slate-400">
                                                                No has autorizado a ningún profesor extra aún.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* --- STUDENTS VIEW --- */}
                            {userType === 'students' && (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <GraduationCap className="w-4 h-4 text-blue-500" />
                                            Alumnos Registrados
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                                                <tr>
                                                    <th className="px-6 py-4">Usuario</th>
                                                    <th className="px-6 py-4">Email</th>
                                                    <th className="px-6 py-4">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {students
                                                    .filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                                                    .map((u) => (
                                                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                            {u.displayName || 'Sin Nombre'}
                                                        </td>
                                                        <td className="px-6 py-4">{u.email}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                                Activo
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {students.length === 0 && !loading && (
                                                    <tr>
                                                        <td colSpan="3" className="px-6 py-8 text-center text-slate-400">
                                                            No hay alumnos registrados aún.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* CONTENT: CUSTOMIZATION TAB */}
                {activeTab === 'customization' && (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in slide-in-from-bottom-4">
                        <Palette className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personalización</h3>
                        <p className="text-slate-500 max-w-md mx-auto mt-2">
                            Configura los colores y logo de la escuela.
                        </p>
                    </div>
                )}
            </main>

            {/* MODAL: ADD TEACHER */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Autorizar Profesor
                            </h3>
                            <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddUser}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email del Profesor
                                </label>
                                <input
                                    type="email"
                                    placeholder="ejemplo@escuela.com"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Este email se añadirá a la lista blanca para permitir el registro.
                                </p>
                            </div>

                            {addError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <XCircle className="w-4 h-4" /> {addError}
                                </div>
                            )}
                            {addSuccess && (
                                <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> {addSuccess}
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all"
                                >
                                    Cerrar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            <span>Autorizar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchoolAdminDashboard;