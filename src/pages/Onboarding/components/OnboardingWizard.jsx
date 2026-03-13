// src/components/onboarding/OnboardingWizard.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, GraduationCap, Key, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../firebase/config'; 
import UserTypeSelector from '../../Auth/components/UserTypeSelector'; 

const OnboardingWizard = ({ user }) => {
    const [missingFields, setMissingFields] = useState([]);
    const [show, setShow] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [tempData, setTempData] = useState({});
    const [saving, setSaving] = useState(false);
    
    // Estados para la validación del código
    const [validating, setValidating] = useState(false);
    const [codeError, setCodeError] = useState("");
    const [accessCode, setAccessCode] = useState('');

    const [attempts, setAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState(0);
    const currentField = missingFields[stepIndex];

    useEffect(() => {
        if (!user) return;
        
        const userRef = doc(db, "users", user.uid);
        
        const unsubscribe = onSnapshot(userRef, (snap) => {
            const required = ['role', 'institutionId', 'displayName'];

            if (snap.exists()) {
                const data = snap.data();
                const missing = required.filter(k => !data[k] || data[k] === "");
                
                if (missing.length > 0) {
                    setMissingFields(missing);
                    setShow(true);
                } else {
                    setMissingFields([]);
                    setShow(false); 
                    unsubscribe(); 
                }
            } else {
                setMissingFields(required);
                setShow(true);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleAnswer = async (key, value) => {
        const updated = { ...tempData, [key]: value };
        setTempData(updated);

        if (stepIndex < missingFields.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            setSaving(true);
            try {
                await setDoc(doc(db, "users", user.uid), {
                    ...updated,
                    uid: user.uid,
                    email: user.email,
                    lastLogin: serverTimestamp()
                }, { merge: true });
                setShow(false);
                window.location.reload();
            } catch (error) {
                console.error("Error saving profile", error);
            } finally {
                setSaving(false);
            }
        }
    };

    // Función para ir al paso anterior
    const handleBack = () => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
            setCodeError(""); // Limpiamos errores por si acaso
        }
    };

    // Temporizador para el bloqueo
    useEffect(() => {
        if (lockoutTime > 0) {
            const timer = setTimeout(() => setLockoutTime(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [lockoutTime]);

    useEffect(() => {
        if (currentField !== 'institutionId') {
            setAccessCode('');
            return;
        }
        setAccessCode(prev => String(prev || '').toUpperCase());
    }, [currentField]);

    const handleCodeValidation = async (e) => {
        e.preventDefault();
        if (lockoutTime > 0) return;

        const code = String(accessCode || '').trim().toUpperCase();
        if (!code) {
            setCodeError("Introduce un código válido.");
            return;
        }
        setValidating(true);
        setCodeError("");

        try {
            const validateFn = httpsCallable(functions, 'validateInstitutionalAccessCode');
            const result = await validateFn({ 
                verificationCode: code, 
                userType: tempData.role,
                email: user.email // Enviamos el email para validar el dominio en el backend
            });

            if (result.data && result.data.institutionId) {
                // ÉXITO
                handleAnswer('institutionId', result.data.institutionId);
            } else {
                throw new Error("Invalid");
            }
        } catch (error) {
            // LÓGICA DE BLOQUEO
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            
            if (newAttempts >= 3) {
                setLockoutTime(30 * (newAttempts - 2)); // 30s, 60s, 90s...
                setCodeError(`Demasiados intentos. Espera ${30 * (newAttempts - 2)} segundos.`);
            } else {
                setCodeError("Código no válido. Revisa que sea el correcto para tu rol.");
            }
        } finally {
            setValidating(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden border border-transparent dark:border-slate-800">
                
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-2 bg-indigo-100 dark:bg-slate-800 w-full">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-500" 
                        style={{ width: `${((stepIndex + 1) / missingFields.length) * 100}%` }} 
                    />
                </div>

                {/* Botón de ir atrás */}
                {stepIndex > 0 && !saving && (
                    <button 
                        onClick={handleBack}
                        className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                        title="Volver al paso anterior"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}

                {saving ? (
                    <div className="flex flex-col items-center py-8">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Configurando tu cuenta...</p>
                    </div>
                ) : (
                    <>
                        {currentField === 'role' && (
                            <div className="animate-fadeIn mt-4">
                                <div className="flex justify-center mb-4"><GraduationCap size={48} className="text-indigo-600 dark:text-indigo-400"/></div>
                                <h3 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">¿Cuál es tu rol?</h3>
                                
                                <UserTypeSelector 
                                    selectedType={tempData.role} 
                                    onSelect={(val) => handleAnswer('role', val)} 
                                />
                            </div>
                        )}

                        {currentField === 'institutionId' && (
                            <div className="animate-fadeIn mt-4">
                                <div className="flex justify-center mb-4"><Key size={48} className="text-emerald-600 dark:text-emerald-400"/></div>
                                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Código de acceso</h3>
                                <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                    Introduce el código que te ha proporcionado tu institución.
                                </p>
                                
                                {codeError && (
                                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                                        <AlertCircle size={16} />
                                        {codeError}
                                    </div>
                                )}

                                <form onSubmit={handleCodeValidation} className="space-y-4">
                                    <input 
                                        name="code" 
                                        placeholder="Introduce tu código" 
                                        value={accessCode}
                                        onChange={(event) => {
                                            setAccessCode(String(event.target.value || '').toUpperCase());
                                            if (codeError) setCodeError('');
                                        }}
                                        onPaste={(event) => {
                                            const clipboardText = event.clipboardData?.getData('text') || '';
                                            if (!clipboardText) return;
                                            event.preventDefault();
                                            setAccessCode(String(clipboardText).trim().toUpperCase());
                                            if (codeError) setCodeError('');
                                        }}
                                        className="w-full p-4 text-center text-2xl tracking-widest font-mono border dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 uppercase" 
                                        required 
                                        disabled={validating || lockoutTime > 0}
                                        autoComplete="off"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={validating || lockoutTime > 0}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-500 text-white py-3 rounded-lg font-bold transition-colors flex justify-center items-center gap-2"
                                    >
                                        {validating ? <Loader2 className="w-5 h-5 animate-spin" /> : (lockoutTime > 0 ? `Bloqueado (${lockoutTime}s)` : "Validar")}
                                    </button>
                                </form>
                            </div>
                        )}

                        {currentField === 'displayName' && (
                            <div className="animate-fadeIn mt-4">
                                <div className="flex justify-center mb-4"><User size={48} className="text-blue-600 dark:text-blue-400"/></div>
                                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">¿Cómo te llamas?</h3>
                                <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                    Este es el nombre que verán tus compañeros y profesores.
                                </p>
                                <form 
                                    onSubmit={(e) => { 
                                        e.preventDefault(); 
                                        const fd = new FormData(e.target); 
                                        handleAnswer('displayName', `${fd.get('fname')} ${fd.get('lname')}`); 
                                    }} 
                                    className="space-y-4"
                                >
                                    <input 
                                        name="fname" 
                                        placeholder="Nombre" 
                                        className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                                        required 
                                    />
                                    <input 
                                        name="lname" 
                                        placeholder="Apellidos" 
                                        className="w-full p-3 border dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" 
                                        required 
                                    />
                                    <button 
                                        type="submit" 
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors"
                                    >
                                        Completar perfil
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default OnboardingWizard;