// src/pages/Profile/components/AdminStatsPanel.tsx
import React from 'react';
import { BookOpen, GraduationCap, LayoutGrid, Loader2, Users } from 'lucide-react';
import type { AdminProfileStats } from '../hooks/useAdminProfileStats';

interface AdminStatsPanelProps {
  stats: AdminProfileStats;
  loading: boolean;
}

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  </div>
);

const AdminStatsPanel = ({ stats, loading }: AdminStatsPanelProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Estadísticas de la institución</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={BookOpen}
            label="Cursos activos"
            value={stats.coursesCount}
            color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            icon={LayoutGrid}
            label="Clases activas"
            value={stats.classesCount}
            color="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
          />
          <StatCard
            icon={GraduationCap}
            label="Profesores"
            value={stats.teachersCount}
            color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            icon={Users}
            label="Alumnos"
            value={stats.studentsCount}
            color="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
          />
        </div>
      )}
    </div>
  );
};

export default AdminStatsPanel;
