// src/pages/UserDetailView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, CheckCircle2, XCircle, BookOpen, Users, TrendingUp } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import Header from '../components/layout/Header';

const UserDetailView = ({ user, userType }) => {
    const { teacherId, studentId } = useParams();
    const navigate = useNavigate();
    const [viewedUser, setViewedUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const userId = userType === 'teacher' ? teacherId : studentId;

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                const userRef = doc(db, 'users', userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setViewedUser({ id: userSnap.id, ...userSnap.data() });
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!viewedUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Usuario no encontrado
                    </h2>
                    <button
                        onClick={() => navigate('/school-admin-dashboard')}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all"
                    >
                        Volver al Panel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <Header user={user} />

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/school-admin-dashboard')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Volver al Panel</span>
                </button>

                {/* User Profile Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-8 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {viewedUser.displayName?.[0] || viewedUser.email?.[0] || '?'}
                            </div>
                            
                            {/* User Info */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {viewedUser.displayName || 'Sin nombre'}
                                </h1>
                                <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} />
                                        <span>{viewedUser.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Miembro desde {new Date(viewedUser.createdAt?.toDate()).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    {viewedUser.enabled !== false ? (
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                                            <CheckCircle2 size={16} />
                                            Activo
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                                            <XCircle size={16} />
                                            Deshabilitado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Role Badge */}
                        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold">
                            {userType === 'teacher' ? '👨‍🏫 Profesor' : '👨‍🎓 Alumno'}
                        </div>
                    </div>
                </div>

                {/* Statistics Grid - Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {userType === 'teacher' ? 'Asignaturas' : 'Asignaturas Inscritas'}
                            </h3>
                            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {userType === 'teacher' 
                                ? (viewedUser.subjects?.length || 0)
                                : (viewedUser.enrolledSubjects?.length || 0)
                            }
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {userType === 'teacher' ? 'Impartiendo' : 'En progreso'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {userType === 'teacher' ? 'Alumnos' : 'Progreso'}
                            </h3>
                            <Users className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {userType === 'teacher' ? '0' : '0%'}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {userType === 'teacher' ? 'Total' : 'Completado'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Actividad
                            </h3>
                            <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {viewedUser.lastLogin 
                                ? new Date(viewedUser.lastLogin.toDate()).toLocaleDateString()
                                : 'N/A'
                            }
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Último acceso
                        </p>
                    </div>
                </div>

                {/* Detailed Information - Placeholder */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 p-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Información Detallada
                    </h2>
                    
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Estadísticas Detalladas Próximamente
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            Aquí se mostrarán estadísticas detalladas de {userType === 'teacher' ? 'asignaturas impartidas, rendimiento de alumnos y actividad docente' : 'progreso en asignaturas, rendimiento en evaluaciones y actividad de estudio'}.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Export both Teacher and Student views
export const TeacherDetailView = ({ user }) => <UserDetailView user={user} userType="teacher" />;
export const StudentDetailView = ({ user }) => <UserDetailView user={user} userType="student" />;

export default UserDetailView;