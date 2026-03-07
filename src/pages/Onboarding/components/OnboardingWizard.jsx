// src/components/onboarding/OnboardingWizard.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, GraduationCap, Key, User, AlertCircle } from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../firebase/config'; // Asegúrate de importar functions
import UserTypeSelector from '../../Auth/components/UserTypeSelector'; 

const OnboardingWizard = ({ user }) => {
    const [missingFields, setMissingFields] = useState([]);
    const [show, setShow] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [tempData, setTempData] = useState({});
    const [saving, setSaving] = useState(false);
    
    // Nuevos estados para la validación del código
    const [validating, setValidating] = useState(false);
    const [codeError, setCodeError] = useState("");

    useEffect(() => {
        if (!user) return;
        
        const userRef = doc(db, "users", user.uid);
        
        const unsubscribe = onSnapshot(userRef, (snap) => {
            // Ahora buscamos que tenga 'institutionId', no el código suelto
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

    // Nueva función exclusiva para validar el código contra el backend
    const handleCodeValidation = async (e) => {
        e.preventDefault();
        const code = new FormData(e.target).get('code').toUpperCase();
        
        setValidating(true);
        setCodeError("");

        try {
            const validateFn = httpsCallable(functions, 'validateInstitutionalAccessCode');
            const result = await validateFn({ 
                code: code, 
                userType: tempData.role // Pasamos el rol que eligió en el paso 1
            });

            if (result.data && result.data.institutionId) {
                // Si es válido, avanzamos y guardamos el ID real de la institución
                handleAnswer('institutionId', result.data.institutionId);
            } else {
                setCodeError("El código no es válido o ha expirado.");
            }
        } catch (error) {
            console.error("Error al validar:", error);
            setCodeError("Error de conexión. Comprueba el código e inténtalo de nuevo.");
        } finally {
            setValidating(false);
        }
    };

    if (!show) return null;

    const currentField = missingFields[stepIndex];

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden border border-transparent dark:border-slate-800">
                <div className="absolute top-0 left-0 h-2 bg-indigo-100 dark:bg-slate-800 w-full">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-500" 
                        style={{ width: `${((stepIndex + 1) / missingFields.length) * 100}%` }} 
                    />
                </div>

                {saving ? (
                    <div className="flex flex-col items-center py-8">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Configurando tu cuenta...</p>
                    </div>
                ) : (
                    <>
                        {currentField === 'role' && (
                            <div className="animate-fadeIn">
                                <div className="flex justify-center mb-4"><GraduationCap size={48} className="text-indigo-600 dark:text-indigo-400"/></div>
                                <h3 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">¿Cuál es tu rol?</h3>
                                
                                <UserTypeSelector 
                                    selectedType={tempData.role} 
                                    onSelect={(val) => handleAnswer('role', val)} 
                                />
                            </div>
                        )}

                        {/* Paso del código actualizado con validación */}
                        {currentField === 'institutionId' && (
                            <div className="animate-fadeIn">
                                <div className="flex justify-center mb-4"><Key size={48} className="text-emerald-600 dark:text-emerald-400"/></div>
                                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Código de acceso</h3>
                                <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
                                    Introduce el código de 6 caracteres que te ha proporcionado tu centro educativo.
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
                                        placeholder="Ej: A3F122" 
                                        className="w-full p-4 text-center text-2xl tracking-[0.25em] font-mono border dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 uppercase" 
                                        required 
                                        maxLength={6}
                                        minLength={6}
                                        autoComplete="off"
                                        disabled={validating}
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={validating}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-lg font-bold transition-colors flex justify-center items-center gap-2"
                                    >
                                        {validating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Validar Código"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {currentField === 'displayName' && (
                            <div className="animate-fadeIn">
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