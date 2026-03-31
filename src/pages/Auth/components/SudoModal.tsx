// src/components/auth/SudoModal.jsx
import React, { useState } from 'react';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Key, AlertTriangle, Loader2, X } from 'lucide-react';

const SudoModal = ({ isOpen, onClose, onConfirm, actionName = "esta acción" }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const auth = getAuth();

  if (!isOpen) return null;

  const handleConfirm = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("No hay usuario activo.");

      // Create a credential with the current user's email and the typed password
      const credential = EmailAuthProvider.credential(user.email, password);
      
      // Re-authenticate with Firebase
      await reauthenticateWithCredential(user, credential);

      // If successful, execute the sensitive function
      await onConfirm();
      
      // Clean up and close
      setPassword('');
      onClose();
    } catch (err) {
      console.error("Sudo Auth Error:", err);
      setError('Contraseña incorrecta. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Confirmar Identidad
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Por tu seguridad, necesitamos confirmar que eres tú antes de <strong>{actionName}</strong>.
        </p>

        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SudoModal;