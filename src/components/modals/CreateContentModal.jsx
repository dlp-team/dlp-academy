import React, { useEffect, useState } from 'react';
import { 
    X, Sparkles, BarChart3, Award, ListOrdered, MessageSquarePlus, 
    Loader2, Wand2, Upload, FileText, Trash2 
} from 'lucide-react';

const QuizModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    formData, 
    setFormData, 
    isGenerating, 
    themeColor // Recibimos el color del tema (ej: 'from-indigo-500 to-purple-600')
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

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

    if (!shouldRender) return null;

    // --- LÓGICA DE COLOR DINÁMICO ---
    // Extraemos el nombre del color base (ej: 'indigo' de 'from-indigo-500')
    // Si no hay themeColor, usamos 'indigo' por defecto.
    const baseColor = themeColor ? themeColor.split('-')[1] : 'indigo';
    
    // Usamos el degradado del tema o uno por defecto
    const gradientClass = themeColor || 'from-indigo-600 to-violet-700';

    const handleClose = () => {
        if (!isGenerating) {
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
            
            {/* BACKDROP */}
            <div 
                className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-500 ease-out 
                ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose} 
            />
            
            {/* MODAL CONTAINER */}
            <div className={`relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] 
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
                transform origin-bottom
                ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'}`}
            >
                
                {/* --- HEADER (Usa gradientClass) --- */}
                <div className={`px-8 py-8 shrink-0 bg-gradient-to-br ${gradientClass} relative overflow-hidden group rounded-t-[2rem]`}>
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
                        disabled={isGenerating}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all duration-300 backdrop-blur-sm shadow-inner hover:rotate-90 hover:scale-110 active:scale-95 z-50 cursor-pointer disabled:opacity-0"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* --- CONTENIDO CON SCROLL --- */}
                <div className="overflow-y-auto p-8 space-y-5 bg-white custom-scrollbar">
                    <form id="quiz-form" onSubmit={onSubmit} className="space-y-5">
                        
                        {/* Título */}
                        <div className="space-y-2 group">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                <BarChart3 className="w-3.5 h-3.5" /> Nombre del Test
                            </label>
                            <input 
                                type="text" 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})} 
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-${baseColor}-500/20 focus:border-${baseColor}-500 transition-all font-semibold text-slate-800 placeholder:text-slate-300`} 
                                placeholder="Ej: Repaso Global - Tema 1" 
                                required 
                                disabled={isGenerating}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            {/* Nivel */}
                            <div className="space-y-2 group">
                                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                    <Award className="w-3.5 h-3.5" /> Nivel
                                </label>
                                <div className="relative">
                                    <select 
                                        value={formData.level} 
                                        onChange={e => setFormData({...formData, level: e.target.value})} 
                                        className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-${baseColor}-500/20 focus:border-${baseColor}-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer hover:bg-slate-100 disabled:opacity-50`}
                                        disabled={isGenerating}
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

                            {/* Cantidad */}
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
                                    className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-${baseColor}-500/20 focus:border-${baseColor}-500 transition-all font-bold text-slate-700 disabled:opacity-50`} 
                                    required
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>

                        {/* Prompt */}
                        <div className="space-y-2 group">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                <MessageSquarePlus className="w-3.5 h-3.5" /> Instrucciones Adicionales
                            </label>
                            <textarea 
                                value={formData.prompt} 
                                onChange={e => setFormData({...formData, prompt: e.target.value})} 
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none h-24 resize-none focus:ring-2 focus:ring-${baseColor}-500/20 focus:border-${baseColor}-500 transition-all font-medium text-slate-600 placeholder:text-slate-300 disabled:opacity-50`} 
                                placeholder="Ej: Enfócate en las excepciones y casos prácticos..."
                                disabled={isGenerating}
                            ></textarea>
                        </div>

                        {/* PDF Upload */}
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
                                    disabled={isGenerating}
                                />
                                
                                {!formData.file ? (
                                    <label 
                                        htmlFor="quiz-pdf-upload"
                                        className={`flex items-center gap-4 w-full px-5 py-3.5 bg-slate-50 border border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-${baseColor}-400 transition-all group`}
                                    >
                                        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className={`w-4 h-4 text-slate-400 group-hover:text-${baseColor}-500 transition-colors`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-600 font-bold text-sm">Subir PDF de referencia</span>
                                            <span className="text-slate-400 text-xs">Opcional - Máx 5MB</span>
                                        </div>
                                    </label>
                                ) : (
                                    <div className={`flex items-center justify-between w-full px-5 py-3.5 bg-${baseColor}-50/50 border border-${baseColor}-100 rounded-2xl transition-all animate-in fade-in zoom-in-95`}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`p-2 bg-white rounded-xl border border-${baseColor}-100 shadow-sm shrink-0`}>
                                                <FileText className={`w-4 h-4 text-${baseColor}-600`} />
                                            </div>
                                            <span className={`text-${baseColor}-900 font-bold text-sm truncate max-w-[200px]`} title={formData.file.name}>
                                                {formData.file.name}
                                            </span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={removeFile}
                                            disabled={isGenerating}
                                            className={`p-2 hover:bg-white rounded-full text-${baseColor}-400 hover:text-red-500 transition-colors hover:shadow-sm`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* --- FOOTER (Fijo) --- */}
                <div className="p-6 pt-2 bg-white border-t border-slate-50 rounded-b-[2rem]">
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            disabled={isGenerating}
                            className="flex-1 px-6 py-4 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-all disabled:opacity-50 text-sm tracking-wide"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            form="quiz-form" 
                            disabled={isGenerating} 
                            className={`flex-[2] px-6 py-4 bg-gradient-to-r ${gradientClass} text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-${baseColor}-500/30 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                                    <span className="animate-pulse">Creando...</span>
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

export default QuizModal;