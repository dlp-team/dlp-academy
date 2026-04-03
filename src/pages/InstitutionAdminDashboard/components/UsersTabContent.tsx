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
  Copy,
  ShieldAlert,
  XCircle
} from 'lucide-react';
import { DEFAULT_ACCESS_POLICIES } from '../../../utils/institutionPolicyUtils';

const UsersTabContent = ({
  userType,
  setUserType,
  accessPolicies,
  onSavePolicies,
  isUpdatingPolicies,
  policyMessage,
  searchTerm,
  setSearchTerm,
  loading,
  teachers,
  students,
  canLoadMoreUsers,
  isLoadingMoreUsers,
  onLoadMoreUsers,
  allowedTeachers,
  onNavigateTeacher,
  onNavigateStudent,
  onRemoveAccess,
  liveAccessCode,
  liveCodeLoading,
  liveCodeError
}: any) => {
  // 1. Filter out the general code so it doesn't appear in the specific invites table
  const specificInvites = allowedTeachers.filter(t => t.type !== 'institutional');
  const normalizedSearchTerm = searchTerm.toLowerCase();
  const filteredTeachers = teachers.filter((teacher: any) => teacher.email?.toLowerCase().includes(normalizedSearchTerm));
  const filteredStudents = students.filter((student: any) => student.email?.toLowerCase().includes(normalizedSearchTerm));
  const activeVisibleCount = userType === 'teachers' ? filteredTeachers.length : filteredStudents.length;

  const [copied, setCopied] = useState(false);
  const [accessDeleteConfirm, setAccessDeleteConfirm] = useState({
    isOpen: false,
    inviteId: null,
    inviteLabel: ''
  });
  const [isRemovingAccess, setIsRemovingAccess] = useState(false);

  // 1. Safe policy handling and local state
  const defaultPolicy = userType === 'teachers'
    ? DEFAULT_ACCESS_POLICIES.teachers
    : DEFAULT_ACCESS_POLICIES.students;
  const currentPolicy = accessPolicies?.[userType] || defaultPolicy;
  
  const [editPolicy, setEditPolicy] = React.useState(currentPolicy);

  // 2. Update local form when admin switches between Teachers <-> Students
  React.useEffect(() => {
    if (accessPolicies) {
      setEditPolicy(accessPolicies[userType] || defaultPolicy);
    }
  }, [userType, accessPolicies, defaultPolicy]);

  // 3. Generate the LIVE code based on the current tab
  const liveCode = editPolicy.requireCode
    ? (liveAccessCode || '------')
    : 'DESACTIVADO';

  const handleCopyLiveCode = () => {
    if (liveCode === 'DESACTIVADO') return;
    navigator.clipboard.writeText(liveCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requestRemoveAccess = (invite: any) => {
    if (!invite?.id || isRemovingAccess) return;

    setAccessDeleteConfirm({
      isOpen: true,
      inviteId: invite.id,
      inviteLabel: invite.email || invite.id
    });
  };

  const closeAccessDeleteConfirm = () => {
    if (isRemovingAccess) return;

    setAccessDeleteConfirm({
      isOpen: false,
      inviteId: null,
      inviteLabel: ''
    });
  };

  const confirmRemoveAccess = async () => {
    if (!accessDeleteConfirm.inviteId || isRemovingAccess) return;

    setIsRemovingAccess(true);
    try {
      await onRemoveAccess(accessDeleteConfirm.inviteId);
    } finally {
      setIsRemovingAccess(false);
      setAccessDeleteConfirm({
        isOpen: false,
        inviteId: null,
        inviteLabel: ''
      });
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
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="space-y-6">
          {/* SECURITY PANEL (Now outside the teacher check, so it shows for students too) */}
          {accessPolicies && (
            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/10 dark:to-slate-900 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-500/20 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                    <ShieldAlert className="w-5 h-5 text-indigo-500" />
                    Seguridad de Acceso ({userType === 'teachers' ? 'Profesores' : 'Alumnos'})
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                    Configura cómo pueden registrarse los {userType === 'teachers' ? 'profesores' : 'alumnos'} en tu institución.
                  </p>
                </div>
                
                {/* LIVE CODE WITH COPY BUTTON */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-center min-w-[150px] flex flex-col items-center">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Código Actual</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xl font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
                      {liveCodeLoading ? '......' : liveCode}
                    </p>
                    {liveCode !== 'DESACTIVADO' && (
                      <button 
                        onClick={handleCopyLiveCode}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="Copiar código"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      </button>
                    )}
                  </div>
                  {liveCodeError && (
                    <p className="mt-2 text-[11px] text-red-500 font-medium">{liveCodeError}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DOMAIN SETTINGS */}
                <div className="space-y-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={editPolicy.requireDomain}
                      onChange={(e) => setEditPolicy({...editPolicy, requireDomain: e.target.checked})}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Requerir Dominio de Email
                  </label>
                  {editPolicy.requireDomain && (
                    <input 
                      type="text"
                      placeholder="Ej: escuela.com, alumnos.org"
                      value={editPolicy.allowedDomains}
                      onChange={(e) => setEditPolicy({...editPolicy, allowedDomains: e.target.value})}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>

                {/* CODE SETTINGS */}
                <div className="space-y-3 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={editPolicy.requireCode}
                      onChange={(e) => setEditPolicy({...editPolicy, requireCode: e.target.checked})}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    Requerir Código Dinámico
                  </label>
                  {editPolicy.requireCode && (
                    <select
                      value={editPolicy.rotationIntervalHours}
                      onChange={(e) => setEditPolicy({...editPolicy, rotationIntervalHours: Number(e.target.value)})}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={1}>Cambiar cada 1 Hora</option>
                      <option value={4}>Cambiar cada 4 Horas</option>
                      <option value={12}>Cambiar cada 12 Horas</option>
                      <option value={24}>Cambiar cada Día</option>
                      <option value={168}>Cambiar cada Semana</option>
                    </select>
                  )}
                </div>
              </div>

              {userType === 'teachers' && (
                <div className="mt-6 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-900/15 px-4 py-3">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    Las opciones de permisos docentes se gestionan ahora desde la pestaña <strong>Configuración</strong>.
                  </p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                {policyMessage?.text && (
                  <p className={`text-sm font-medium flex items-center gap-1.5 animate-in fade-in ${policyMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {policyMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} 
                    {policyMessage.text}
                  </p>
                )}
                <button
                  onClick={() => onSavePolicies({ ...accessPolicies, [userType]: editPolicy })}
                  disabled={isUpdatingPolicies}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  Guardar Políticas
                </button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {activeVisibleCount} resultado(s)
            </span>
          </div>

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
                      {filteredTeachers.map(u => (
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
                      {filteredTeachers.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No hay profesores registrados aún.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {canLoadMoreUsers && (
                  <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                    <button
                      onClick={onLoadMoreUsers}
                      disabled={isLoadingMoreUsers}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
                    >
                      {isLoadingMoreUsers ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cargando...
                        </>
                      ) : 'Cargar más profesores'}
                    </button>
                  </div>
                )}
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
                            <button onClick={() => requestRemoveAccess(t)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar invitación">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {specificInvites.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No hay invitaciones pendientes.</td></tr>
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
                    {filteredStudents.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => onNavigateStudent(u.id)}>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.displayName || 'Sin Nombre'}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Activo</span>
                        </td>
                        <td className="px-6 py-4 text-right"><ChevronRight className="w-4 h-4 text-slate-300 ml-auto" /></td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No hay alumnos registrados aún.</td></tr>}
                  </tbody>
                </table>
              </div>
              {canLoadMoreUsers && (
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                  <button
                    onClick={onLoadMoreUsers}
                    disabled={isLoadingMoreUsers}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
                  >
                    {isLoadingMoreUsers ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cargando...
                      </>
                    ) : 'Cargar más alumnos'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {accessDeleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60" onClick={closeAccessDeleteConfirm} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-delete-confirm-title"
            className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
          >
            <div className="p-6">
              <h3 id="invite-delete-confirm-title" className="text-lg font-black text-slate-900 dark:text-white">
                Eliminar acceso de profesor
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Se eliminará la invitación de "{accessDeleteConfirm.inviteLabel || 'este profesor'}". Esta acción no se puede deshacer.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAccessDeleteConfirm}
                  disabled={isRemovingAccess}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveAccess}
                  disabled={isRemovingAccess}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                >
                  {isRemovingAccess ? 'Eliminando...' : 'Eliminar acceso'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTabContent;
