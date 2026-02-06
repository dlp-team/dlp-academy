import React, { useEffect, useState } from 'react';
import { X, Sparkles, BarChart3, Award, ListOrdered, MessageSquarePlus, Loader2, Wand2 } from 'lucide-react';

const QuizModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    formData, 
    setFormData, 
    isGenerating, 
    themeColor 
}) => {
    // Estado interno para controlar si el modal está "visible" visualmente
    const [isVisible, setIsVisible] = useState(false);
    
    // Estado para mantener el modal montado mientras termina la animación de salida
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

    const baseColorClass = themeColor ? themeColor.split('-')[1] : 'indigo'; 

    const handleClose = () => {
        if (!isGenerating) {
            setIsVisible(false);
            onClose(); 
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'visible' : 'invisible'}`}>
            
            {/* BACKDROP */}
            <div 
                className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-500 ease-out 
                ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose} 
            />
            
            {/* MODAL 
                CAMBIOS REALIZADOS:
                1. Eliminado 'shadow-black/40': Quita la sombra negra fuerte.
                2. Eliminado 'ring-2' y 'ring-${baseColorClass}-500/30': Quita el borde de color/negro alrededor.
                3. Se mantiene 'shadow-2xl' para una elevación suave (por defecto grisácea), o cámbialo a 'shadow-none' para diseño plano.
            */}
            <div className={`relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden 
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] 
                transform origin-bottom
                ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'}`}
            >
                
                {/* --- HEADER --- */}
                <div className={`px-8 py-10 bg-gradient-to-br ${themeColor || 'from-indigo-600 to-violet-700'} relative overflow-hidden group`}>
                    {/* Decoración de fondo */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-[2000ms] group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col gap-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 w-fit mb-3 shadow-lg">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Power</span>
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                            Nuevo Entrenamiento
                        </h3>
                        <p className="text-white/80 font-medium text-sm mt-1 max-w-xs leading-relaxed">
                            Diseña tu test a medida usando inteligencia artificial.
                        </p>
                    </div>
                    
                    {/* BOTÓN CERRAR */}
                    <button 
                        onClick={(e) => { e.preventDefault(); handleClose(); }} 
                        disabled={isGenerating}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all duration-300 backdrop-blur-sm shadow-inner hover:rotate-90 hover:scale-110 active:scale-95 z-50 cursor-pointer disabled:opacity-0"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* --- FORMULARIO --- */}
                <form onSubmit={onSubmit} className="p-8 space-y-6 bg-white">
                    
                    {/* Input: Título */}
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                            <BarChart3 className="w-3.5 h-3.5" /> Nombre del Test
                        </label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-${baseColorClass}-500/20 focus:border-${baseColorClass}-500 transition-all font-semibold text-slate-800 placeholder:text-slate-300`} 
                            placeholder="Ej: Repaso Global - Tema 1" 
                            required 
                            disabled={isGenerating}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {/* Selector: Dificultad */}
                        <div className="space-y-2 group">
                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                                <Award className="w-3.5 h-3.5" /> Nivel
                            </label>
                            <div className="relative">
                                <select 
                                    value={formData.level} 
                                    onChange={e => setFormData({...formData, level: e.target.value})} 
                                    className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-${baseColorClass}-500/20 focus:border-${baseColorClass}-500 transition-all font-bold text-slate-700 appearance-none cursor-pointer hover:bg-slate-100 disabled:opacity-50`}
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

                        {/* Input: Cantidad */}
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
                                className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-${baseColorClass}-500/20 focus:border-${baseColorClass}-500 transition-all font-bold text-slate-700 disabled:opacity-50`} 
                                required
                                disabled={isGenerating}
                            />
                        </div>
                    </div>

                    {/* Textarea: Prompt */}
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 transition-colors">
                            <MessageSquarePlus className="w-3.5 h-3.5" /> Instrucciones Adicionales
                        </label>
                        <textarea 
                            value={formData.prompt} 
                            onChange={e => setFormData({...formData, prompt: e.target.value})} 
                            className={`w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none h-24 resize-none focus:ring-2 focus:ring-${baseColorClass}-500/20 focus:border-${baseColorClass}-500 transition-all font-medium text-slate-600 placeholder:text-slate-300 disabled:opacity-50`} 
                            placeholder="Ej: Enfócate en las excepciones y casos prácticos..."
                            disabled={isGenerating}
                        ></textarea>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className="flex gap-3 pt-2">
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
                            disabled={isGenerating} 
                            className={`flex-[2] px-6 py-4 bg-gradient-to-r ${themeColor || 'from-slate-800 to-slate-900'} text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-${baseColorClass}-500/30 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed`}
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
                </form>
            </div>
        </div>
    );
};

export default QuizModal;