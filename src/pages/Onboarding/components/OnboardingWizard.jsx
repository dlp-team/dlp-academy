// src/components/onboarding/OnboardingWizard.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, GraduationCap, Globe, User } from 'lucide-react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
// Make sure to import the selector from the correct path
import UserTypeSelector from '../../Auth/components/UserTypeSelector'; 

const OnboardingWizard = ({ user }) => {
    const [missingFields, setMissingFields] = useState([]);
    const [show, setShow] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [tempData, setTempData] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        const userRef = doc(db, "users", user.uid);
        
        // Setup listener
        const unsubscribe = onSnapshot(userRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                const required = ['role', 'country', 'displayName'];
                const missing = required.filter(k => !data[k] || data[k] === "");
                
                if (missing.length > 0) {
                    setMissingFields(missing);
                    setShow(true);
                } else {
                    // Data is complete! Hide wizard and KILL the listener immediately.
                    setMissingFields([]);
                    setShow(false); 
                    unsubscribe(); // This ensures no background requests are made ever again
                }
            } else {
                // If document doesn't exist yet, just show the wizard temporarily
                setMissingFields(['displayName', 'role', 'country']);
            }
        });

        // Cleanup in case the component unmounts before the snapshot finishes
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

    if (!show) return null;

    const currentField = missingFields[stepIndex];

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden border border-transparent dark:border-slate-800">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 h-2 bg-indigo-100 dark:bg-slate-800 w-full">
                    <div 
                        className="h-full bg-indigo-600 transition-all duration-500" 
                        style={{ width: `${(stepIndex / missingFields.length) * 100}%` }} 
                    />
                </div>

                {saving ? (
                    <div className="flex flex-col items-center py-8">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Guardando tu perfil...</p>
                    </div>
                ) : (
                    <>
                        {/* Step 1: Role Selection (Using your Component) */}
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

                        {/* Step 2: Country Selection */}
                        {currentField === 'country' && (
                            <div className="animate-fadeIn">
                                <div className="flex justify-center mb-4"><Globe size={48} className="text-emerald-600 dark:text-emerald-400"/></div>
                                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">¿De dónde eres?</h3>
                                <select
                                    className="w-full p-3 border dark:border-slate-700 rounded-lg text-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white mt-4 outline-none focus:ring-2 focus:ring-emerald-500"
                                    onChange={(e) => handleAnswer('country', e.target.value)}
                                    defaultValue=""
                                >
                                    <option value="" disabled className="dark:bg-slate-800">Selecciona tu país...</option>
                                    <option value="es" className="dark:bg-slate-800">España 🇪🇸</option>
                                    <option value="mx" className="dark:bg-slate-800">México 🇲🇽</option>
                                    <option value="ar" className="dark:bg-slate-800">Argentina 🇦🇷</option>
                                    <option value="co" className="dark:bg-slate-800">Colombia 🇨🇴</option>
                                    <option value="other" className="dark:bg-slate-800">Otro 🌍</option>
                                </select>
                            </div>
                        )}

                        {/* Step 3: Name Input */}
                        {currentField === 'displayName' && (
                            <div className="animate-fadeIn">
                                <div className="flex justify-center mb-4"><User size={48} className="text-blue-600 dark:text-blue-400"/></div>
                                <h3 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">¿Cómo te llamas?</h3>
                                <form 
                                    onSubmit={(e) => { 
                                        e.preventDefault(); 
                                        const fd = new FormData(e.target); 
                                        handleAnswer('displayName', `${fd.get('fname')} ${fd.get('lname')}`); 
                                    }} 
                                    className="space-y-4 mt-4"
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
                                        Continuar
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