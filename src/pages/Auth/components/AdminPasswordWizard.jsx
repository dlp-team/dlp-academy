import React, { useState, useEffect } from 'react';
import { Loader2, Lock, AlertCircle, LogOut } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { updatePassword, signOut } from 'firebase/auth'; // IMPORTAMOS signOut
import { db, auth } from '../../../firebase/config'; 

const AdminPasswordWizard = ({ user }) => {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;

        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const hasPassword = currentUser.providerData?.some(p => p.providerId === 'password');
        
        if (hasPassword) {
            setShow(false);
            return;
        }

        const userRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                if (data.role === 'institutionadmin') {
                    setShow(true);
                } else {
                    setShow(false);
                }
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const pass1 = fd.get('pass1');
        const pass2 = fd.get('pass2');

        if (pass1 !== pass2) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        if (pass1.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await updatePassword(auth.currentUser, pass1);
            setShow(false);
            window.location.reload();
        } catch (err) {
            console.error("Error setting admin password:", err);
            if (err.code === 'auth/requires-recent-login') {
                setError("Por seguridad, debes cerrar sesión y volver a entrar con Google antes de crear la contraseña.");
            } else {
                setError("Hubo un error al configurar la contraseña. Inténtalo de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    // --- NUEVA FUNCIÓN PARA CERRAR SESIÓN ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // El listener de App.jsx detectará el cambio y lo enviará al login automáticamente
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden border border-transparent dark:border-slate-800 animate-fadeIn">
                
                <div className="flex justify-center mb-4">
                    <Lock size={48} className="text-purple-600 dark:text-purple-400"/>
                </div>
                
                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                    Seguridad de Administrador
                </h3>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl mb-6 border border-purple-100 dark:border-purple-800/50">
                    <p className="text-center text-purple-800 dark:text-purple-300 text-sm">
                        Como administrador de la institución, es obligatorio configurar una contraseña maestra para proteger acciones críticas en el panel, incluso si iniciaste sesión con Google.
                    </p>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span className="leading-tight">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        name="pass1" 
                        type="password"
                        placeholder="Nueva contraseña" 
                        className="w-full p-3 border dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" 
                        required 
                    />
                    <input 
                        name="pass2" 
                        type="password"
                        placeholder="Repite la contraseña" 
                        className="w-full p-3 border dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500" 
                        required 
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-lg font-bold transition-colors flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar contraseña"}
                    </button>

                    {/* --- NUEVO BOTÓN DE CERRAR SESIÓN --- */}
                    <button 
                        type="button" 
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-lg font-medium transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <LogOut size={18} />
                        Cerrar sesión
                    </button>
                </form>

            </div>
        </div>
    );
};

export default AdminPasswordWizard;