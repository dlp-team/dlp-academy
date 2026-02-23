<<<<<<< HEAD
import React, { useEffect, useState, useMemo } from 'react';
import { X, Sparkles, BarChart3, Award, ListOrdered, MessageSquarePlus, Loader2, Wand2, Upload, FileText, Trash2, ChevronDown } from 'lucide-react';
=======
// src/components/modals/QuizModal.jsx
import React, { useEffect, useState } from 'react';
import { X, Sparkles, BarChart3, Award, ListOrdered, MessageSquarePlus, Loader2, Wand2, Upload, FileText, Trash2 } from 'lucide-react';
>>>>>>> 633d164fe15b2630f5fba7fc245a6ea5a1e2f040

const QuizModal = ({ 
    isOpen, 
    onClose, 
    formData, 
    setFormData, 
    themeColor, // Expected format: "from-blue-500 to-indigo-600"
    subjectId,
    topicId
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [loading, setLoading] = useState(false);

    const WEBHOOK_URL = 'https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook/711e538b-9d63-42bb-8494-873301ffdf39';

    // --- 1. EXTRACT COLOR NAME ---
    const colorName = useMemo(() => {
        const firstPart = themeColor?.split(' ')[0] || '';
        return firstPart.replace('from-', '').split('-')[0] || 'indigo';
    }, [themeColor]);

    // --- 2. MAP TO EXPLICIT TAILWIND CLASSES ---
    // This is crucial. Tailwind purges unused classes. We must list them explicitly.
    const themeStyles = useMemo(() => {
        const colors = {
            blue: { ring: 'focus:ring-blue-500/20', border: 'focus:border-blue-500', shadow: 'shadow-blue-500/30', hoverBorder: 'hover:border-blue-400', bg: 'bg-blue-50', text: 'text-blue-600' },
            indigo: { ring: 'focus:ring-indigo-500/20', border: 'focus:border-indigo-500', shadow: 'shadow-indigo-500/30', hoverBorder: 'hover:border-indigo-400', bg: 'bg-indigo-50', text: 'text-indigo-600' },
            emerald: { ring: 'focus:ring-emerald-500/20', border: 'focus:border-emerald-500', shadow: 'shadow-emerald-500/30', hoverBorder: 'hover:border-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-600' },
            purple: { ring: 'focus:ring-purple-500/20', border: 'focus:border-purple-500', shadow: 'shadow-purple-500/30', hoverBorder: 'hover:border-purple-400', bg: 'bg-purple-50', text: 'text-purple-600' },
            red: { ring: 'focus:ring-red-500/20', border: 'focus:border-red-500', shadow: 'shadow-red-500/30', hoverBorder: 'hover:border-red-400', bg: 'bg-red-50', text: 'text-red-600' },
            amber: { ring: 'focus:ring-amber-500/20', border: 'focus:border-amber-500', shadow: 'shadow-amber-500/30', hoverBorder: 'hover:border-amber-400', bg: 'bg-amber-50', text: 'text-amber-600' },
            violet: { ring: 'focus:ring-violet-500/20', border: 'focus:border-violet-500', shadow: 'shadow-violet-500/30', hoverBorder: 'hover:border-violet-400', bg: 'bg-violet-50', text: 'text-violet-600' },
            pink: { ring: 'focus:ring-pink-500/20', border: 'focus:border-pink-500', shadow: 'shadow-pink-500/30', hoverBorder: 'hover:border-pink-400', bg: 'bg-pink-50', text: 'text-pink-600' },
            cyan: { ring: 'focus:ring-cyan-500/20', border: 'focus:border-cyan-500', shadow: 'shadow-cyan-500/30', hoverBorder: 'hover:border-cyan-400', bg: 'bg-cyan-50', text: 'text-cyan-600' },
            teal: { ring: 'focus:ring-teal-500/20', border: 'focus:border-teal-500', shadow: 'shadow-teal-500/30', hoverBorder: 'hover:border-teal-400', bg: 'bg-teal-50', text: 'text-teal-600' },
            orange: { ring: 'focus:ring-orange-500/20', border: 'focus:border-orange-500', shadow: 'shadow-orange-500/30', hoverBorder: 'hover:border-orange-400', bg: 'bg-orange-50', text: 'text-orange-600' },
            sky: { ring: 'focus:ring-sky-500/20', border: 'focus:border-sky-500', shadow: 'shadow-sky-500/30', hoverBorder: 'hover:border-sky-400', bg: 'bg-sky-50', text: 'text-sky-600' },
            lime: { ring: 'focus:ring-lime-500/20', border: 'focus:border-lime-500', shadow: 'shadow-lime-500/30', hoverBorder: 'hover:border-lime-400', bg: 'bg-lime-50', text: 'text-lime-600' },
            fuchsia: { ring: 'focus:ring-fuchsia-500/20', border: 'focus:border-fuchsia-500', shadow: 'shadow-fuchsia-500/30', hoverBorder: 'hover:border-fuchsia-400', bg: 'bg-fuchsia-50', text: 'text-fuchsia-600' },
            rose: { ring: 'focus:ring-rose-500/20', border: 'focus:border-rose-500', shadow: 'shadow-rose-500/30', hoverBorder: 'hover:border-rose-400', bg: 'bg-rose-50', text: 'text-rose-600' }
        };
        return colors[colorName] || colors.indigo;
    }, [colorName]);

    useEffect(() => {
        let timeoutId;
        if (isOpen) {
            setShouldRender(true);
            timeoutId = setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            timeoutId = setTimeout(() => setShouldRender(false), 500);
        }
        return () => clearTimeout(timeoutId);
    }, [isOpen]);

    const handleInternalSubmit = async (e) => {
        e.preventDefault();
        
        if (!subjectId || !topicId) {
            alert("Error crítico: No se identificó la Asignatura o el Tema. Recarga la página.");
            return;
        }

        setLoading(true);

        try {
            const dataToSend = new FormData();
            
            dataToSend.append('title', formData.title);
            dataToSend.append('level', formData.level);
            dataToSend.append('numQuestions', formData.numQuestions);
            dataToSend.append('prompt', formData.prompt);
            dataToSend.append('subjectId', subjectId);
            dataToSend.append('topicId', topicId);
            
            if (formData.file) {
                dataToSend.append('file', formData.file);
            }

            console.log(`📤 Enviando test a ${subjectId}/${topicId}...`);

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: dataToSend,
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ Respuesta de n8n:", result);

            handleClose();
            alert("¡Solicitud enviada! Tu test aparecerá en unos momentos.");

        } catch (error) {
            console.error("❌ Error enviando al webhook:", error);
            alert("Error al conectar con el generador de tests. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    if (!shouldRender) return null;

    const handleClose = () => {
        if (!loading) {
            setIsVisible(false);
            onClose(); 
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setFormData({ ...formData, file: file });
    };

    const removeFile = () => {
        setFormData({ ...formData, file: null });
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'visible' : 'invisible'}`}>
            
            <div 
                className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-500 ease-out 
                ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose} 
            />
            
            <div className={`relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] 
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
                transform origin-bottom
                ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'}`}
            >
                {/* HEADER */}
                <div className={`px-8 py-8 shrink-0 bg-gradient-to-br ${themeColor || 'from-indigo-600 to-violet-700'} relative overflow-hidden group rounded-t-[2rem]`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-[2000ms] group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 w-fit mb-3 shadow-lg">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Power</span>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                            Crear test
                        </h3>
                        <p className="text-white/80 font-medium text-sm mt-1 max-w-xs leading-relaxed">
                            Diseña tu test a medida usando inteligencia artificial.
                        </p>
                    </div>
                    
                    <button 
                        onClick={(e) => { e.preventDefault(); handleClose(); }} 
                        disabled={loading}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all duration-300 backdrop-blur-sm shadow-inner hover:rotate-90 hover:scale-110 active:scale-95 z-50 cursor-pointer disabled:opacity-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* FORM CONTENT */}
                <div className="overflow-y-auto p-8 space-y-5 bg-white custom-scrollbar">
                    <form id="quiz-form" onSubmit={handleInternalSubmit} className="space-y-5">
                        
                        <div className="space-y-2 group">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                <BarChart3 className="w-3.5 h-3.5" /> Nombre del Test
                            </label>
                            <input 
                                type="text" 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-semibold text-slate-800 placeholder:text-slate-300 focus:ring-2 ${themeStyles.ring} ${themeStyles.border}`} 
                                placeholder="Ej: Repaso Global - Tema 1" 
                                required 
                                disabled={loading}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                    <Award className="w-3.5 h-3.5" /> Nivel
                                </label>
                                <div className="relative">
                                    <select 
                                        value={formData.level} 
                                        onChange={e => setFormData({...formData, level: e.target.value})} 
                                        className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-bold text-slate-700 appearance-none cursor-pointer hover:bg-slate-100 disabled:opacity-50 focus:ring-2 ${themeStyles.ring} ${themeStyles.border}`}
                                        disabled={loading}
                                    >
                                        <option value="Principiante">Básico</option>
                                        <option value="Intermedio">Medio</option>
                                        <option value="Avanzado">Experto</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDownIcon />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                    <ListOrdered className="w-3.5 h-3.5" /> Preguntas
                                </label>
                                <input 
                                    type="number" 
                                    value={formData.numQuestions} 
                                    onChange={e => setFormData({...formData, numQuestions: e.target.value})} 
                                    min="1" max="20" 
                                    className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-bold text-slate-700 disabled:opacity-50 focus:ring-2 ${themeStyles.ring} ${themeStyles.border}`} 
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                <MessageSquarePlus className="w-3.5 h-3.5" /> Instrucciones Adicionales
                            </label>
                            <textarea 
                                value={formData.prompt} 
                                onChange={e => setFormData({...formData, prompt: e.target.value})} 
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none h-24 resize-none transition-all font-medium text-slate-600 placeholder:text-slate-300 disabled:opacity-50 focus:ring-2 ${themeStyles.ring} ${themeStyles.border}`} 
                                placeholder="Ej: Enfócate en las excepciones y casos prácticos..."
                                disabled={loading}
                            ></textarea>
                        </div>

                        <div className="space-y-2 group">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 transition-colors">
                                <Upload className="w-3.5 h-3.5" /> Material de Apoyo (PDF)
                            </label>
                            
                            <div className="relative">
                                <input 
                                    type="file" 
                                    id="quiz-pdf-upload"
                                    accept=".pdf" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                                
                                {!formData.file ? (
                                    <label 
                                        htmlFor="quiz-pdf-upload" 
                                        className={`flex items-center gap-4 w-full px-5 py-3.5 bg-slate-50 border border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-slate-100 transition-all group ${themeStyles.hoverBorder}`}
                                    >
                                        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-600 font-bold text-sm">Subir PDF de referencia</span>
                                            <span className="text-slate-400 text-xs">Opcional - Máx 5MB</span>
                                        </div>
                                    </label>
                                ) : (
                                    <div className={`flex items-center justify-between w-full px-5 py-3.5 ${themeStyles.bg} border ${themeStyles.border.replace('focus:', '')} rounded-2xl transition-all animate-in fade-in zoom-in-95`}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                                                <FileText className={`w-4 h-4 ${themeStyles.text}`} />
                                            </div>
                                            <span className={`font-bold text-sm truncate max-w-[200px] ${themeStyles.text}`}>{formData.file.name}</span>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={removeFile} 
                                            disabled={loading} 
                                            className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-colors hover:shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* FOOTER */}
                <div className="p-6 pt-2 bg-white border-t border-slate-50 rounded-b-[2rem]">
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            disabled={loading}
                            className="flex-1 px-6 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all disabled:opacity-50 text-sm tracking-wide"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            form="quiz-form"
                            disabled={loading} 
                            className={`flex-[2] px-6 py-4 bg-gradient-to-r ${themeColor || 'from-slate-800 to-slate-900'} text-white rounded-2xl font-black uppercase tracking-widest shadow-lg ${themeStyles.shadow} transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                                    <span className="animate-pulse">Enviando...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    <span>Generar Test</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Auxiliary icon for select
const ChevronDownIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
);

export default QuizModal;