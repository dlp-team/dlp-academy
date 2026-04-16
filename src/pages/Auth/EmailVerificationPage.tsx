// src/pages/Auth/EmailVerificationPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import {
    GraduationCap,
    Mail,
    RefreshCw,
    LogOut,
    CheckCircle,
    AlertCircle,
    Loader2,
} from 'lucide-react';

const EmailVerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isFromRegistration = searchParams.get('registered') === 'true';

    const [resendCooldown, setResendCooldown] = useState(isFromRegistration ? 60 : 0);
    const [resendLoading, setResendLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [verifyError, setVerifyError] = useState('');
    const [resendError, setResendError] = useState('');

    const currentUser = auth.currentUser;
    const userEmail = currentUser?.email || '';

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleResend = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        setResendLoading(true);
        setResendError('');
        setResendSuccess(false);
        try {
            await sendEmailVerification(currentUser);
            setResendSuccess(true);
            setResendCooldown(60);
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (err: any) {
            if (err.code === 'auth/too-many-requests') {
                setResendError('Demasiados intentos. Espera un momento antes de volver a intentarlo.');
            } else {
                setResendError('No se pudo reenviar el correo. Inténtalo de nuevo.');
            }
        } finally {
            setResendLoading(false);
        }
    };

    const handleAlreadyVerified = async () => {
        setVerifyLoading(true);
        setVerifyError('');
        try {
            if (!currentUser) {
                navigate('/login');
                return;
            }
            await currentUser.reload();
            if (auth.currentUser?.emailVerified) {
                // Hard reload so App.tsx onAuthStateChanged re-reads emailVerified = true
                window.location.href = '/home';
            } else {
                setVerifyError(
                    'Aún no hemos detectado la verificación. Revisa tu bandeja de entrada y haz clic en el enlace del correo.'
                );
            }
        } catch {
            setVerifyError('No se pudo verificar el estado del correo. Inténtalo de nuevo.');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } finally {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 dark:bg-indigo-700 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-indigo-900 to-indigo-900" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">DLP Academy</span>
                </div>
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Casi estás dentro.
                    </h1>
                    <p className="text-indigo-100 dark:text-indigo-200 text-lg leading-relaxed">
                        Solo necesitamos confirmar que eres el dueño de tu correo electrónico
                        antes de darte acceso completo a la plataforma.
                    </p>
                </div>
                <div className="relative z-10 text-sm text-indigo-200 dark:text-indigo-300">
                    © 2026 DLP Academy. Todos los derechos reservados.
                </div>
            </div>

            {/* Right action panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-950 transition-colors">
                <div className="w-full max-w-md">
                    {/* Mobile header */}
                    <div className="text-center mb-8 lg:hidden">
                        <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-4 transition-colors">
                            <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            DLP Academy
                        </h1>
                    </div>

                    {/* Mail icon */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                            <Mail className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                        Verifica tu correo
                    </h2>

                    {userEmail ? (
                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                            Hemos enviado un enlace de verificación a{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {userEmail}
                            </span>
                            . Revisa tu bandeja de entrada y haz clic en el enlace para activar
                            tu cuenta.
                        </p>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                            Hemos enviado un enlace de verificación a tu correo electrónico.
                            Revisa tu bandeja de entrada y haz clic en el enlace para activar
                            tu cuenta.
                        </p>
                    )}

                    {/* Success message */}
                    {resendSuccess && (
                        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm">
                            <CheckCircle size={16} />
                            Correo reenviado correctamente. Revisa tu bandeja de entrada.
                        </div>
                    )}

                    {/* Resend error */}
                    {resendError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle size={16} />
                            {resendError}
                        </div>
                    )}

                    {/* Verify check error */}
                    {verifyError && (
                        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
                            <AlertCircle size={16} />
                            {verifyError}
                        </div>
                    )}

                    <div className="space-y-3">
                        {/* Primary: already verified */}
                        <button
                            onClick={handleAlreadyVerified}
                            disabled={verifyLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-70"
                        >
                            {verifyLoading ? (
                                <Loader2 className="animate-spin w-5 h-5" />
                            ) : (
                                <CheckCircle className="w-5 h-5" />
                            )}
                            Ya verifiqué mi correo
                        </button>

                        {/* Secondary: resend */}
                        <button
                            onClick={handleResend}
                            disabled={resendLoading || resendCooldown > 0}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-semibold rounded-xl transition-colors disabled:opacity-60"
                        >
                            {resendLoading ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            {resendCooldown > 0
                                ? `Reenviar correo (${resendCooldown}s)`
                                : 'Reenviar correo de verificación'}
                        </button>

                        {/* Tertiary: sign out */}
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationPage;
