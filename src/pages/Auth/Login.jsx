// src/pages/Auth/Login.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// 1. Remove the CSS module import and replace with Lucide icons
import { Mail, Lock, GraduationCap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import { useLogin } from './hooks/useLogin';


const Login = () => {
    const {
        email, setEmail,
        password, setPassword,
        error,
        loading,
        rememberMe, setRememberMe,
        handleLogin,
        handleGoogleLogin
    } = useLogin();



    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
            
            {/* --- LEFT PANEL: Branding (Mirroring Register) --- */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 dark:bg-indigo-700 relative overflow-hidden flex-col justify-between p-12 text-white">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-indigo-900 to-indigo-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">DLP Academy</span>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Bienvenido de nuevo.</h1>
                    <p className="text-indigo-100 dark:text-indigo-200 text-lg leading-relaxed">
                        Accede a tu aula virtual con IA y continúa gestionando tus asignaturas, tests y materiales educativos.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-indigo-200 dark:text-indigo-300">
                    © 2026 DLP Academy. Todos los derechos reservados.
                </div>
            </div>

            {/* --- RIGHT PANEL: Form --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-950 transition-colors">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 lg:hidden">
                        <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-4 transition-colors">
                            <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Iniciar Sesión</h1>
                    </div>
                    
                    <h2 className="hidden lg:block text-3xl font-bold text-gray-900 dark:text-white mb-2">Iniciar Sesión</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Ingresa para gestionar tus asignaturas.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2 transition-colors">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all text-gray-900 dark:text-white"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="rememberMe"
                                    checked={rememberMe} 
                                    onChange={(e) => setRememberMe(e.target.checked)} 
                                    className="w-4 h-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-slate-900"
                                />
                                <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                    Recordarme
                                </label>
                            </div>
                            <a href="#" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline transition-colors">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Iniciar Sesión <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <div className="mt-8 mb-6 flex items-center text-gray-400 dark:text-gray-500">
                        <div className="flex-grow border-t border-gray-300 dark:border-slate-700"></div>
                        <span className="px-4 text-sm bg-slate-50 dark:bg-slate-950">O continúa con</span>
                        <div className="flex-grow border-t border-gray-300 dark:border-slate-700"></div>
                    </div>

                    <button 
                        type="button" 
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <FcGoogle size={24} />
                        Google
                    </button>

                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
