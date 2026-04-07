// src/components/modals/QuizModal.tsx
import React, { useEffect, useState } from 'react';
import { X, Sparkles, BarChart3, Award, ListOrdered, MessageSquarePlus, Wand2, Upload, FileText, Trash2 } from 'lucide-react';
import AIGenerationModalShell from './shared/AIGenerationModalShell';

const QuizModal = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    themeColor,
    subjectId,
    topicId,
    onToast
}: any) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    const WEBHOOK_URL = 'https://podzolic-dorethea-rancorously.ngrok-free.dev/webhook/711e538b-9d63-42bb-8494-873301ffdf39';

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

    // Fire-and-forget: cierra el modal inmediatamente y envía en segundo plano
    const handleInternalSubmit = async (e: any) => {
        e.preventDefault();

        // Prefer centralized Topic handler to keep one consistent save flow.
        if (typeof onSubmit === 'function') {
            await onSubmit(e);
            return;
        }

        if (!subjectId || !topicId) {
            if (onToast) onToast({ show: true, message: 'Error: No se identificó la Asignatura o el Tema.' });
            return;
        }

        const dataToSend = new FormData();
        dataToSend.append('title', formData.title);
        dataToSend.append('level', formData.level);
        dataToSend.append('numQuestions', formData.numQuestions);
        dataToSend.append('prompt', formData.prompt || '');
        dataToSend.append('subjectId', subjectId);
        dataToSend.append('topicId', topicId);
        if (formData.file) {
            dataToSend.append('file', formData.file);
            dataToSend.append('files', formData.file);
        }

        // Cerrar modal inmediatamente
        handleClose();
        if (onToast) onToast({ show: true, message: 'Solicitud enviada. Tu test se está generando...' });

        // Enviar en segundo plano
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: dataToSend,
            });

            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

            // Some webhook responses are empty/non-JSON despite successful processing.
            let result = null;
            try {
                const text = await response.text();
                result = text ? JSON.parse(text) : null;
            } catch {
                result = null;
            }
            if (onToast) onToast({ show: true, message: '¡Test generado correctamente! Recarga para verlo.' });
        } catch (error) {
            console.error("❌ Error enviando al webhook:", error);
            if (onToast) onToast({ show: true, message: 'Error al generar el test. Inténtalo de nuevo.' });
        }
    };

    const gradientClass = themeColor || 'from-indigo-600 to-violet-700';

    const handleClose = () => {
        setIsVisible(false);
        onClose();
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        if (file) setFormData({ ...formData, file: file });
    };

    const removeFile = () => {
        setFormData({ ...formData, file: null });
    };

    return (
        <AIGenerationModalShell
            shouldRender={shouldRender}
            isVisible={isVisible}
            onRequestClose={handleClose}
            maxWidthClassName="max-w-lg"
        >
            {/* HEADER */}
            <div className={`px-8 py-7 shrink-0 bg-gradient-to-br ${gradientClass} relative overflow-hidden group rounded-t-[2rem]`}>
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
                        onClick={(e: any) => { e.preventDefault(); handleClose(); }} 
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all duration-300 backdrop-blur-sm shadow-inner hover:rotate-90 hover:scale-110 active:scale-95 z-50 cursor-pointer"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
            </div>

            {/* FORM CONTENT */}
            <div className="overflow-y-auto flex-1 p-8 space-y-5 bg-white dark:bg-slate-900 custom-scrollbar">
                    <form id="quiz-form" onSubmit={handleInternalSubmit} className="space-y-5">
                        
                        <div className="space-y-2 group">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                <BarChart3 className="w-3.5 h-3.5" /> Nombre del Test
                            </label>
                            <input 
                                type="text" 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600" 
                                placeholder="Ej: Repaso Global - Tema 1" 
                                required 

                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                    <Award className="w-3.5 h-3.5" /> Nivel
                                </label>
                                <div className="relative">
                                    <select 
                                        value={formData.level} 
                                        onChange={e => setFormData({...formData, level: e.target.value})} 
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-300 appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
        
                                    >
                                        <option value="Principiante">Básico</option>
                                        <option value="Intermedio">Medio</option>
                                        <option value="Avanzado">Experto</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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
                                    min="1" 
                                    max="20" 
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50" 
                                    required
    
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
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none h-24 resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-600 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:opacity-50" 
                                placeholder="Ej: Enfócate en las excepciones y casos prácticos..."

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
    
                                />
                                
                                {!formData.file ? (
                                    <label 
                                        htmlFor="quiz-pdf-upload"
                                        className="flex items-center gap-4 w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
                                    >
                                        <div className="p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">Subir PDF de referencia</span>
                                            <span className="text-slate-400 dark:text-slate-500 text-xs">Opcional - Máx 5MB</span>
                                        </div>
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between w-full px-5 py-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 rounded-2xl transition-all animate-in fade-in zoom-in-95">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm shrink-0">
                                                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <span className="text-indigo-900 dark:text-indigo-200 font-bold text-sm truncate max-w-[200px]" title={formData.file.name}>
                                                {formData.file.name}
                                            </span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={removeFile}
            
                                            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-indigo-400 dark:text-indigo-500 hover:text-red-500 transition-colors hover:shadow-sm"
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
            <div className="p-6 pt-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-b-[2rem] shrink-0">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-6 py-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-sm tracking-wide"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            form="quiz-form"
                            className={`flex-[2] px-6 py-4 bg-gradient-to-r ${gradientClass} text-white rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            <Wand2 className="w-5 h-5" />
                            <span>Generar Test</span>
                        </button>
                    </div>
                </div>

        </AIGenerationModalShell>
    );
};

export default QuizModal;