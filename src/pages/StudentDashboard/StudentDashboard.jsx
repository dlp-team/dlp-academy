import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Clock, BarChart3 } from 'lucide-react';
import Header from '../../components/layout/Header';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  useIdleTimeout(15);

  useEffect(() => {
    if (user && user.role !== 'student') {
      console.warn('Unauthorized access to Student Dashboard');
      navigate('/home');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      <Header user={user} />

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel del Estudiante</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Bienvenido, {user?.displayName || user?.email}. Aquí verás tu actividad académica.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-medium">
            <GraduationCap className="w-4 h-4" /> Cuenta de Estudiante
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-0.5">—</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Asignaturas</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-0.5">—</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Progreso Global</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-0.5">—</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Tiempo de Estudio</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-0.5">—</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Evaluaciones</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Este panel está listo para integrar progreso, tareas y resultados del estudiante.
          </p>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
