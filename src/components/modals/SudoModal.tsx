// src/components/modals/SudoModal.tsx
import React, { useState, useMemo } from 'react';
import { AlertTriangle, Key, Loader2, X } from 'lucide-react';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { auth } from '../../firebase/config';
import BaseModal from '../ui/BaseModal';

const SudoModal = ({
  isOpen,
  onClose,
  onConfirm,
  actionName = 'esta acción',
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect if user has a password provider or only social (Google) providers
  const hasPasswordProvider = useMemo(() => {
    const currentUser = auth.currentUser;
    return currentUser?.providerData?.some((p) => p.providerId === 'password') ?? false;
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    setPassword('');
    setError('');
    onClose();
  };

  const handleGoogleReauth = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setError('No se pudo verificar tu sesión actual. Inicia sesión de nuevo.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const googleProvider = new GoogleAuthProvider();
      await reauthenticateWithPopup(currentUser, googleProvider);
      await onConfirm();
      setError('');
      onClose();
    } catch (submissionError: any) {
      if (submissionError?.code === 'auth/popup-closed-by-user') {
        setError('Ventana de autenticación cerrada. Inténtalo de nuevo.');
      } else if (submissionError?.code === 'auth/user-mismatch') {
        setError('La cuenta de Google no coincide con tu sesión actual.');
      } else {
        setError('No se pudo completar la verificación con Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    // If no password provider, use Google reauth
    if (!hasPasswordProvider) {
      await handleGoogleReauth();
      return;
    }

    const currentUser = auth.currentUser;
    const normalizedPassword = password.trim();

    if (!currentUser?.email) {
      setError('No se pudo verificar tu sesión actual. Inicia sesión de nuevo.');
      return;
    }

    if (!normalizedPassword) {
      setError('Debes introducir tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        normalizedPassword,
      );

      await reauthenticateWithCredential(currentUser, credential);
      await onConfirm();
      setPassword('');
      setError('');
      onClose();
    } catch (submissionError: any) {
      if (submissionError?.code === 'auth/wrong-password' || submissionError?.code === 'auth/invalid-credential') {
        setError('Contraseña incorrecta. Inténtalo de nuevo.');
      } else {
        setError('No se pudo verificar la contraseña o completar la acción.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      onBeforeClose={() => !isSubmitting}
      backdropClassName="absolute inset-0 bg-black/60 backdrop-blur-sm"
      contentWrapperClassName="relative z-10 flex min-h-full items-center justify-center p-4"
      contentClassName="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden"
    >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-amber-50/70 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirmación de seguridad</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Vuelve a autenticarte para {actionName}.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {hasPasswordProvider ? (
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Contraseña
              <div className="relative mt-1.5">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Introduce tu contraseña"
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
            </label>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Haz clic en &quot;Confirmar&quot; para verificar tu identidad a través de Google.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar
            </button>
          </div>
        </form>
    </BaseModal>
  );
};

export default SudoModal;