// src/pages/Settings/components/SecuritySection.tsx
import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import SudoModal from '../../../components/modals/SudoModal';

const MIN_PASSWORD_LENGTH = 8;

const SecuritySection = ({ onLogout }: any) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingPasswordLink, setSendingPasswordLink] = useState(false);
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

  const handleSendPasswordLink = async () => {
    const currentUser = auth.currentUser;
    resetFeedback();

    if (!currentUser?.email) {
      setErrorMessage('No se detectó un correo válido en la sesión actual.');
      return;
    }

    setSendingPasswordLink(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setSuccessMessage(
        hasPasswordProvider
          ? 'Enviamos un enlace de verificación a tu correo para cambiar la contraseña.'
          : 'Enviamos un enlace de verificación a tu correo para establecer una contraseña y entrar también con email.'
      );
    } catch (error: any) {
      if (error?.code === 'auth/too-many-requests') {
        setErrorMessage('Demasiados intentos. Espera unos minutos antes de solicitar otro enlace.');
      } else {
        setErrorMessage('No se pudo enviar el enlace de verificación por correo en este momento.');
      }
    } finally {
      setSendingPasswordLink(false);
    }
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
    } catch (error: any) {
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
                Envía un enlace de verificación por correo para establecer o cambiar tu contraseña de forma segura.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSendPasswordLink}
              disabled={sendingPasswordLink}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {sendingPasswordLink ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              {sendingPasswordLink
                ? 'Enviando enlace...'
                : hasPasswordProvider
                  ? 'Enviar enlace de verificación'
                  : 'Configurar contraseña por correo'}
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Recibirás un correo para completar el proceso con validación de identidad.
            </span>
          </div>

          {hasPasswordProvider ? (
            <>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Cambio rápido con contraseña actual
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={requestPasswordChange}
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  {savingPassword ? 'Actualizando...' : 'Actualizar ahora'}
                </button>
              </div>
            </>
          ) : (
            <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">
              Cuenta social detectada: usa el enlace por correo para establecer tu contraseña y habilitar inicio con email.
            </p>
          )}

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
