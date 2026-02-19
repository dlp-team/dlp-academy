// src/pages/Auth/Register.jsx
import React from 'react';
import { Mail, Lock, GraduationCap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Hook
import { useRegister } from './hooks/useRegister';

// Components
import UserTypeSelector from './components/UserTypeSelector';
import PasswordStrengthMeter from './components/PasswordStrengthMeter';

const Register = () => {
    const { formData, strength, loading, error, handleChange, registerUser, setFormData } = useRegister();

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
            
            {/* --- LEFT PANEL: Branding & Image --- */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 dark:bg-indigo-700 relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-indigo-900 to-indigo-900"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">DLP Academy</span>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Tu viaje de aprendizaje comienza aquí.</h1>
                    <p className="text-indigo-100 dark:text-indigo-200 text-lg leading-relaxed">
                        Únete a miles de estudiantes y docentes que ya están transformando su manera de enseñar y aprender con inteligencia artificial.
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
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Crear Cuenta</h1>
                    </div>
                    
                    <h2 className="hidden lg:block text-3xl font-bold text-gray-900 dark:text-white mb-2">Crear Cuenta</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Completa tus datos para empezar gratis.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2 transition-colors">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={registerUser} className="space-y-5">
                        
                        <UserTypeSelector 
                            selectedType={formData.userType} 
                            onSelect={(type) => setFormData(prev => ({ ...prev, userType: type }))} 
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                                <input 
                                    type="text" name="firstName" required
                                    value={formData.firstName} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all text-gray-900 dark:text-white"
                                    placeholder="Juan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellidos</label>
                                <input 
                                    type="text" name="lastName" required
                                    value={formData.lastName} onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all text-gray-900 dark:text-white"
                                    placeholder="Pérez"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                <input 
                                    type="email" name="email" required
                                    value={formData.email} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all text-gray-900 dark:text-white"
                                    placeholder="nombre@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">País</label>
                            <select 
                                name="country" required
                                value={formData.country} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all text-gray-900 dark:text-white"
                            >
                                <option value="" disabled>Selecciona tu país</option>
                                <option value="es">España 🇪🇸</option>
                                <option value="mx">México 🇲🇽</option>
                                <option value="ar">Argentina 🇦🇷</option>
                                <option value="co">Colombia 🇨🇴</option>
                                <option value="cl">Chile 🇨🇱</option>
                                <option value="other">Otro 🌍</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                <input 
                                    type="password" name="password" required
                                    value={formData.password} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                            {formData.password && <PasswordStrengthMeter strength={strength} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                                <input 
                                    type="password" name="confirmPassword" required
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-all text-gray-900 dark:text-white"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" id="rememberMe" name="rememberMe"
                                checked={formData.rememberMe} onChange={handleChange}
                                className="w-4 h-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-slate-900"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                                Recordarme en este dispositivo
                            </label>
                        </div>

                        <div className="flex items-start gap-2 pt-2">
                            <input 
                                type="checkbox" required 
                                className="mt-1 w-4 h-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-slate-900" 
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Al registrarme, acepto los <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Términos de Servicio</a> y la <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">Política de Privacidad</a> de DLP Academy.
                            </span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Crear Cuenta <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;