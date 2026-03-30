// src/pages/Settings/components/SecuritySection.jsx
import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { updatePassword } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import SudoModal from '../../../components/modals/SudoModal';

const MIN_PASSWORD_LENGTH = 8;

const SecuritySection = ({ onLogout }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showSudoModal, setShowSudoModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const hasPasswordProvider = useMemo(
    () => Boolean(auth.currentUser?.providerData?.some((provider) => provider?.providerId === 'password')),
    []
  );

  const resetFeedback = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const validatePasswordChange = () => {
    const normalizedPassword = newPassword.trim();
    const normalizedConfirm = confirmPassword.trim();

    if (!hasPasswordProvider) {
      setErrorMessage('Tu cuenta no usa contraseña. Inicia sesión con tu proveedor habitual para gestionar la seguridad.');
      return false;
    }

    if (normalizedPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return false;
    }

    if (normalizedPassword !== normalizedConfirm) {
      setErrorMessage('La confirmación no coincide con la nueva contraseña.');
      return false;
    }

    return true;
  };

  const requestPasswordChange = () => {
    resetFeedback();
    if (!validatePasswordChange()) return;
    setShowSudoModal(true);
  };

  const confirmPasswordChange = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setErrorMessage('No se detectó una sesión activa. Vuelve a iniciar sesión e inténtalo de nuevo.');
      return;
    }

    setSavingPassword(true);
    try {
      await updatePassword(currentUser, newPassword.trim());
      setSuccessMessage('Contraseña actualizada correctamente.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error?.code === 'auth/weak-password') {
        setErrorMessage('La contraseña es demasiado débil. Usa una combinación más robusta.');
      } else {
        setErrorMessage('No se pudo actualizar la contraseña en este momento.');
      }
      throw error;
    } finally {
      setSavingPassword(false);
      setShowSudoModal(false);
    }
  };

  const handleLogout = async () => {
    if (!onLogout) return;

    setLoggingOut(true);
    resetFeedback();
    try {
      await onLogout();
    } catch {
      setErrorMessage('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <section>
      <h2 className="text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">Seguridad</h2>

      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 transition-colors duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <KeyRound size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Cambiar contraseña</p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Se solicitará tu contraseña actual para confirmar la operación.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <label className="text-sm text-gray-600 dark:text-slate-300">
              Nueva contraseña
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full mt-1.5 px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mínimo 8 caracteres"
              />
            </label>

            <label className="text-sm text-gray-600 dark:text-slate-300">
              Confirmar contraseña
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full mt-1.5 px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Repite la nueva contraseña"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={requestPasswordChange}
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
            {!hasPasswordProvider && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Cuenta social detectada: el cambio de contraseña no está disponible para este inicio de sesión.
              </span>
            )}
          </div>

          {errorMessage && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={15} /> {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={15} /> {successMessage}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-4 transition-colors duration-300 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Cerrar sesión</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Finaliza la sesión actual en este dispositivo.</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            {loggingOut ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>
      </div>

      <SudoModal
        isOpen={showSudoModal}
        onClose={() => setShowSudoModal(false)}
        onConfirm={confirmPasswordChange}
        actionName="cambiar tu contraseña"
      />
    </section>
  );
};

export default SecuritySection;
