import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Loader2,
  Search,
  Trash2,
  UserPlus,
} from 'lucide-react';

const UsersTabContent = ({
  userType,
  setUserType,
  searchTerm,
  setSearchTerm,
  loading,
  teachers,
  students,
  allowedTeachers,
  onNavigateTeacher,
  onNavigateStudent,
  onRemoveAccess,
}) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 justify-between">
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => {
            setUserType('teachers');
            setSearchTerm('');
          }}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
            userType === 'teachers' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Profesores
        </button>
        <button
          onClick={() => {
            setUserType('students');
            setSearchTerm('');
          }}
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
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => onNavigateTeacher(u.id)}>
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
                          <button onClick={() => onRemoveAccess(t.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Revocar acceso">
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
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => onNavigateStudent(u.id)}>
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
);

export default UsersTabContent;
