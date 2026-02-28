import React from 'react';
import { CheckCircle2, Loader2, UserPlus, XCircle } from 'lucide-react';

const AddTeacherModal = ({
  isSubmitting,
  newUserEmail,
  onEmailChange,
  onClose,
  onSubmit,
  addError,
  addSuccess,
}) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Autorizar Profesor</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email del Profesor</label>
          <input
            type="email"
            placeholder="ejemplo@escuela.com"
            value={newUserEmail}
            onChange={e => onEmailChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            required
          />
          <p className="text-xs text-gray-500 mt-2">Este email se añadirá a la lista blanca para permitir el registro.</p>
        </div>
        {addError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><XCircle className="w-4 h-4" /> {addError}</div>}
        {addSuccess && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {addSuccess}</div>}
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all">Cerrar</button>
          <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all flex justify-center items-center gap-2">
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" /><span>Autorizar</span></>}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default AddTeacherModal;
