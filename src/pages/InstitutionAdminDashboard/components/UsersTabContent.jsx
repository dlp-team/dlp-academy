import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Loader2,
  Search,
  Trash2,
  UserPlus,
  Eye,
  EyeOff,
  Copy,
  XCircle
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
  institutionalCode,
  onUpdateInstitutionalCode,
  isUpdatingCode,
  codeUpdateSuccess,
  codeUpdateError
}) => {
  // 1. Filter out the general code so it doesn't appear in the specific invites table
  const specificInvites = allowedTeachers.filter(t => t.type !== 'institutional');

  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    const code = document.getElementById('instCodeInput').value;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
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
              {/* Código General para Profesores */}
              <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-slate-900 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-500/20 mb-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                      <BookOpen className="w-5 h-5 text-indigo-500" />
                      Código General para Profesores
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                      Comparte este código con tus profesores. Podrán usarlo en la pantalla de registro para unirse automáticamente a tu institución sin necesidad de recibir una invitación por email.
                    </p>
                  </div>
                  
                  <div className="flex flex-col w-full md:w-auto gap-3">
                    <div className="flex w-full md:w-auto gap-2">
                      <div className="relative w-full md:w-64">
                        <input
                          id="instCodeInput"
                          type={showCode ? "text" : "password"}
                          defaultValue={institutionalCode}
                          placeholder="Ej. MADRID-2026"
                          className="w-full pl-4 pr-20 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-center font-bold text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                          <button
                            onClick={() => setShowCode(!showCode)}
                            className="p-1.5 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                            title={showCode ? "Ocultar código" : "Mostrar código"}
                          >
                            {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={handleCopyCode}
                            className="p-1.5 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                            title="Copiar código"
                          >
                            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => onUpdateInstitutionalCode(document.getElementById('instCodeInput').value)}
                        disabled={isUpdatingCode}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isUpdatingCode ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                      </button>
                    </div>
                    
                    {/* IN-APP NOTIFICATIONS (replaces window.alert) */}
                    {codeUpdateSuccess && (
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 className="w-4 h-4" /> {codeUpdateSuccess}
                      </p>
                    )}
                    {codeUpdateError && (
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                        <XCircle className="w-4 h-4" /> {codeUpdateError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
                    <UserPlus className="w-4 h-4 text-indigo-500" /> Invitaciones Pendientes
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Tipo / Email</th>
                        <th className="px-6 py-4">Código de Acceso</th>
                        <th className="px-6 py-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {specificInvites.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-6 py-4 font-medium">
                            {t.type === 'institutional' ? (
                              <span className="text-purple-600 dark:text-purple-400">Código Institucional General</span>
                            ) : (
                              t.email
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <code className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md font-mono font-bold tracking-wide">
                                  {t.id}
                                </code>
                                <button 
                                  onClick={() => navigator.clipboard.writeText(t.id)}
                                  className="text-xs text-slate-400 hover:text-indigo-500 transition-colors"
                                  title="Copiar código"
                                >
                                  Copiar
                                </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 w-32 text-right">
                            <button onClick={() => onRemoveAccess(t.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar invitación">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {specificInvites.length === 0 && (
                        <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">No hay invitaciones pendientes.</td></tr>
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
};

export default UsersTabContent;
