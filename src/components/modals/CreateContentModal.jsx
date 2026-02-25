// src/components/modals/CreateContentModal.jsx
import React, { useEffect, useState } from 'react';
import {
    X, Sparkles, Loader2, Wand2, Upload, FileText, Trash2,
    BookOpen, Calculator, PenTool, ClipboardCheck,
    MessageSquarePlus, Layers, BarChart3, Hash,
    CheckCircle2, Lightbulb, ListChecks, Clock,
    ChevronDown, Zap, Eye
} from 'lucide-react';

// ==================== CONTENT TYPE DEFINITIONS ====================

const CONTENT_TYPES = [
    {
        id: 'summary',
        label: 'Resumen',
        description: 'Genera un resumen completo del tema con explicaciones claras y ejemplos.',
        icon: BookOpen,
        gradient: 'from-blue-500 to-cyan-500',
        badge: 'Popular',
    },
    {
        id: 'formulas',
        label: 'Formulario',
        description: 'Crea una hoja de fórmulas organizada y lista para estudiar.',
        icon: Calculator,
        gradient: 'from-emerald-500 to-teal-500',
        badge: null,
    },
    {
        id: 'exercise',
        label: 'Ejercicios',
        description: 'Genera ejercicios prácticos con resolución paso a paso.',
        icon: PenTool,
        gradient: 'from-amber-500 to-orange-500',
        badge: null,
    },
    {
        id: 'exam',
        label: 'Examen',
        description: 'Diseña un examen tipo test o desarrollo para evaluar conocimientos.',
        icon: ClipboardCheck,
        gradient: 'from-purple-500 to-pink-500',
        badge: 'Pro',
    },
];

// ==================== TYPE-SPECIFIC OPTIONS ====================

const TypeSpecificOptions = ({ type, formData, setFormData, baseColor, disabled }) => {
    const updateField = (key, value) => {
        setFormData({ ...formData, [key]: value });
    };

    const ToggleOption = ({ field, label, icon: Icon, description }) => (
        <button
            type="button"
            disabled={disabled}
            onClick={() => updateField(field, !formData[field])}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all duration-300 text-left ${
                formData[field]
                    ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white shadow-lg'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            } disabled:opacity-50`}
        >
            <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                formData[field]
                    ? 'bg-white/20 dark:bg-slate-900/20'
                    : 'bg-slate-100 dark:bg-slate-700'
            }`}>
                <Icon className={`w-3.5 h-3.5 ${
                    formData[field]
                        ? 'text-white dark:text-slate-900'
                        : 'text-slate-500 dark:text-slate-400'
                }`} />
            </div>
            <div className="flex-1 min-w-0">
                <span className={`text-xs font-bold block ${
                    formData[field]
                        ? 'text-white dark:text-slate-900'
                        : 'text-slate-700 dark:text-slate-300'
                }`}>{label}</span>
                {description && (
                    <span className={`text-[10px] block mt-0.5 ${
                        formData[field]
                            ? 'text-white/70 dark:text-slate-900/70'
                            : 'text-slate-400 dark:text-slate-500'
                    }`}>{description}</span>
                )}
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                formData[field]
                    ? 'border-white/50 dark:border-slate-900/50 bg-white/20 dark:bg-slate-900/20'
                    : 'border-slate-300 dark:border-slate-600'
            }`}>
                {formData[field] && <CheckCircle2 className={`w-3.5 h-3.5 ${formData[field] ? 'text-white dark:text-slate-900' : ''}`} />}
            </div>
        </button>
    );

    if (type === 'summary') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    <ToggleOption field="includeExamples" label="Incluir ejemplos" icon={Lightbulb} description="Ejemplos prácticos" />
                    <ToggleOption field="includeFormulas" label="Con fórmulas" icon={Calculator} description="Fórmulas clave" />
                </div>
            </div>
        );
    }

    if (type === 'formulas') {
        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                        <Layers className="w-3.5 h-3.5" /> Formato
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { value: 'compact', label: 'Compacto', desc: 'Solo fórmulas' },
                            { value: 'detailed', label: 'Detallado', desc: 'Con descripciones' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={disabled}
                                onClick={() => updateField('formulaFormat', opt.value)}
                                className={`p-3 rounded-xl border-2 text-center transition-all duration-300 ${
                                    formData.formulaFormat === opt.value
                                        ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-lg scale-[1.02]'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                                } disabled:opacity-50`}
                            >
                                <span className="text-xs font-black block">{opt.label}</span>
                                <span className={`text-[10px] block mt-0.5 ${
                                    formData.formulaFormat === opt.value
                                        ? 'text-white/70 dark:text-slate-900/70'
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}>{opt.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <ToggleOption field="includeDerivations" label="Derivaciones" icon={Layers} description="Paso a paso" />
                    <ToggleOption field="includeExamples" label="Con ejemplos" icon={Lightbulb} description="Uso práctico" />
                </div>
            </div>
        );
    }

    if (type === 'exercise') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                            <BarChart3 className="w-3.5 h-3.5" /> Dificultad
                        </label>
                        <div className="relative">
                            <select
                                value={formData.difficulty || 'intermedio'}
                                onChange={e => updateField('difficulty', e.target.value)}
                                disabled={disabled}
                                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                            >
                                <option value="basico">Básico</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                                <option value="mixto">Mixto</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                            <Hash className="w-3.5 h-3.5" /> Ejercicios
                        </label>
                        <input
                            type="number"
                            value={formData.numExercises || 5}
                            onChange={e => updateField('numExercises', parseInt(e.target.value) || 5)}
                            min="1"
                            max="20"
                            disabled={disabled}
                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm text-slate-700 dark:text-slate-300 disabled:opacity-50"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <ToggleOption field="includeSolutions" label="Con soluciones" icon={CheckCircle2} description="Paso a paso" />
                    <ToggleOption field="includeExamples" label="Ejemplo resuelto" icon={Lightbulb} description="1 ejemplo guía" />
                </div>
            </div>
        );
    }

    if (type === 'exam') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                            <BarChart3 className="w-3.5 h-3.5" /> Dificultad
                        </label>
                        <div className="relative">
                            <select
                                value={formData.difficulty || 'intermedio'}
                                onChange={e => updateField('difficulty', e.target.value)}
                                disabled={disabled}
                                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                            >
                                <option value="basico">Básico</option>
                                <option value="intermedio">Intermedio</option>
                                <option value="avanzado">Avanzado</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                                <ChevronDown className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                            <Hash className="w-3.5 h-3.5" /> Preguntas
                        </label>
                        <input
                            type="number"
                            value={formData.numQuestions || 10}
                            onChange={e => updateField('numQuestions', parseInt(e.target.value) || 10)}
                            min="1"
                            max="30"
                            disabled={disabled}
                            className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm text-slate-700 dark:text-slate-300 disabled:opacity-50"
                        />
                    </div>
                    <div className="space-y-2 group">
                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                            <Clock className="w-3.5 h-3.5" /> Duración
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={formData.examDuration || 60}
                                onChange={e => updateField('examDuration', parseInt(e.target.value) || 60)}
                                min="5"
                                max="300"
                                disabled={disabled}
                                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-sm text-slate-700 dark:text-slate-300 disabled:opacity-50 pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-slate-500 pointer-events-none">min</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                        <ListChecks className="w-3.5 h-3.5" /> Formato del examen
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { value: 'test', label: 'Tipo test', desc: 'Opciones múltiples' },
                            { value: 'development', label: 'Desarrollo', desc: 'Respuesta abierta' },
                            { value: 'mixed', label: 'Mixto', desc: 'Ambos formatos' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={disabled}
                                onClick={() => updateField('examFormat', opt.value)}
                                className={`p-3 rounded-xl border-2 text-center transition-all duration-300 ${
                                    formData.examFormat === opt.value
                                        ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-lg scale-[1.02]'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                                } disabled:opacity-50`}
                            >
                                <span className="text-xs font-black block">{opt.label}</span>
                                <span className={`text-[10px] block mt-0.5 ${
                                    formData.examFormat === opt.value
                                        ? 'text-white/70 dark:text-slate-900/70'
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}>{opt.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {/* Modo del examen: Práctica vs Real */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                        <Zap className="w-3.5 h-3.5" /> Modo del examen
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { value: 'practice', label: 'Práctica', desc: 'Para estudiar y practicar' },
                            { value: 'real', label: 'Real', desc: 'Evaluación oficial' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={disabled}
                                onClick={() => {
                                    const updates = { examMode: opt.value };
                                    if (opt.value === 'real') updates.showResultsToStudents = false;
                                    setFormData({ ...formData, ...updates });
                                }}
                                className={`p-3 rounded-xl border-2 text-center transition-all duration-300 ${
                                    formData.examMode === opt.value
                                        ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-lg scale-[1.02]'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                                } disabled:opacity-50`}
                            >
                                <span className="text-xs font-black block">{opt.label}</span>
                                <span className={`text-[10px] block mt-0.5 ${
                                    formData.examMode === opt.value
                                        ? 'text-white/70 dark:text-slate-900/70'
                                        : 'text-slate-400 dark:text-slate-500'
                                }`}>{opt.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <ToggleOption field="includeAnswerKey" label="Clave respuestas" icon={CheckCircle2} description="Solucionario" />
                    {formData.examMode === 'practice' && (
                        <ToggleOption field="showResultsToStudents" label="Mostrar resultados" icon={Eye} description="Alumnos ven sus notas" />
                    )}
                </div>
            </div>
        );
    }

    return null;
};

// ==================== MAIN MODAL COMPONENT ====================

const CreateContentModal = ({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    isGenerating,
    themeColor,
    subjectId,
    topicId
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [step, setStep] = useState(1); // 1 = type selection, 2 = options

    useEffect(() => {
        let timeoutId;
        if (isOpen) {
            setShouldRender(true);
            setStep(1);
            timeoutId = setTimeout(() => setIsVisible(true), 10);
        } else {
            setIsVisible(false);
            timeoutId = setTimeout(() => {
                setShouldRender(false);
                setStep(1);
            }, 500);
        }
        return () => clearTimeout(timeoutId);
    }, [isOpen]);

    if (!shouldRender) return null;

    const gradientClass = themeColor || 'from-indigo-600 to-violet-700';

    const handleClose = () => {
        if (!isGenerating) {
            setIsVisible(false);
            onClose();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setFormData({ ...formData, file });
    };

    const removeFile = () => {
        setFormData({ ...formData, file: null });
    };

    const selectType = (typeId) => {
        const defaults = {
            summary: { includeExamples: true, includeFormulas: false },
            formulas: { formulaFormat: 'detailed', includeDerivations: false, includeExamples: true },
            exercise: { difficulty: 'intermedio', numExercises: 5, includeSolutions: true, includeExamples: false },
            exam: { difficulty: 'intermedio', numQuestions: 10, examFormat: 'test', includeAnswerKey: true, examDuration: 60, examMode: 'practice', showResultsToStudents: true },
        };

        setFormData({
            ...formData,
            type: typeId,
            title: formData.title || '',
            ...(defaults[typeId] || {}),
        });
        setStep(2);
    };

    const selectedType = CONTENT_TYPES.find(t => t.id === formData.type);
    const SelectedIcon = selectedType?.icon || BookOpen;

    return (
        <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-500 ${isVisible ? 'visible' : 'invisible'}`}>

            {/* BACKDROP */}
            <div
                className={`fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-500 ease-out
                ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* MODAL */}
            <div className={`relative bg-white dark:bg-slate-900 rounded-t-[2rem] sm:rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]
                transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                transform origin-bottom
                ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8 pointer-events-none'}`}
            >

                {/* HEADER */}
                <div className={`px-8 py-7 shrink-0 bg-gradient-to-br ${gradientClass} relative overflow-hidden group rounded-t-[2rem]`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none transition-transform duration-[2000ms] group-hover:scale-110" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                    <div className="relative z-10 flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 w-fit mb-3 shadow-lg">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Generador IA</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight leading-none drop-shadow-sm">
                                {step === 1 ? 'Crear Material' : (
                                    <span className="flex items-center gap-2">
                                        <SelectedIcon className="w-6 h-6" />
                                        {selectedType?.label}
                                    </span>
                                )}
                            </h3>
                            <p className="text-white/80 font-medium text-sm mt-1 max-w-xs leading-relaxed">
                                {step === 1
                                    ? 'Elige el tipo de material que quieres generar con IA.'
                                    : 'Personaliza las opciones antes de generar.'
                                }
                            </p>
                        </div>

                        <button
                            onClick={(e) => { e.preventDefault(); handleClose(); }}
                            disabled={isGenerating}
                            className="p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all duration-300 backdrop-blur-sm shadow-inner hover:rotate-90 hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-0 shrink-0"
                            type="button"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="overflow-y-auto flex-1 custom-scrollbar">

                    {/* STEP 1: TYPE SELECTION */}
                    {step === 1 && (
                        <div className="p-6 space-y-3">
                            {CONTENT_TYPES.map((type) => {
                                const TypeIcon = type.icon;
                                return (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => selectType(type.id)}
                                        className="w-full group/type relative flex items-center gap-4 p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-lg transition-all duration-300 text-left hover:-translate-y-0.5"
                                    >
                                        <div className={`relative shrink-0`}>
                                            <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} rounded-xl blur-lg opacity-0 group-hover/type:opacity-50 transition-opacity duration-500`} />
                                            <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center text-white shadow-lg group-hover/type:scale-110 group-hover/type:rotate-3 transition-all duration-500`}>
                                                <TypeIcon className="w-6 h-6" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-base font-black text-slate-900 dark:text-slate-100">{type.label}</span>
                                                {type.badge && (
                                                    <span className={`px-2 py-0.5 rounded-md bg-gradient-to-r ${type.gradient} text-white text-[9px] font-bold uppercase tracking-widest`}>
                                                        {type.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{type.description}</p>
                                        </div>

                                        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover/type:bg-slate-200 dark:group-hover/type:bg-slate-600 transition-all">
                                            <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover/type:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* STEP 2: OPTIONS */}
                    {step === 2 && (
                        <div className="p-6">
                            <form id="content-form" onSubmit={onSubmit} className="space-y-5">

                                {/* Title */}
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 dark:group-focus-within:text-slate-200 transition-colors">
                                        <BarChart3 className="w-3.5 h-3.5" /> Título del Material
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        placeholder={`Ej: ${selectedType?.label} - Tema 1`}
                                        required
                                        disabled={isGenerating}
                                    />
                                </div>

                                {/* Type-specific options */}
                                <TypeSpecificOptions
                                    type={formData.type}
                                    formData={formData}
                                    setFormData={setFormData}
                                    disabled={isGenerating}
                                />

                                {/* Custom instructions */}
                                <div className="space-y-2 group">
                                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-slate-800 dark:group-focus-within:text-slate-200 transition-colors">
                                        <MessageSquarePlus className="w-3.5 h-3.5" /> Instrucciones para la IA
                                        <span className="text-slate-300 dark:text-slate-600 font-normal normal-case tracking-normal">(opcional)</span>
                                    </label>
                                    <textarea
                                        value={formData.prompt || ''}
                                        onChange={e => setFormData({...formData, prompt: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none h-24 resize-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 disabled:opacity-50"
                                        placeholder="Ej: Enfócate en los teoremas principales, incluye demostraciones..."
                                        disabled={isGenerating}
                                    />
                                </div>

                                {/* PDF Upload */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                        <Upload className="w-3.5 h-3.5" /> Material de Referencia
                                        <span className="text-slate-300 dark:text-slate-600 font-normal normal-case tracking-normal">(opcional)</span>
                                    </label>

                                    <input
                                        type="file"
                                        id="content-pdf-upload"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={isGenerating}
                                    />

                                    {!formData.file ? (
                                        <label
                                            htmlFor="content-pdf-upload"
                                            className="flex items-center gap-4 w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group/upload"
                                        >
                                            <div className="p-2 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm group-hover/upload:scale-110 transition-transform">
                                                <Upload className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover/upload:text-indigo-500 transition-colors" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-slate-600 dark:text-slate-300 font-bold text-sm">Subir un PDF de referencia</span>
                                                <span className="text-slate-400 dark:text-slate-500 text-xs">La IA lo usará como base para el contenido</span>
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
                                                disabled={isGenerating}
                                                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-indigo-400 dark:text-indigo-500 hover:text-red-500 transition-colors hover:shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-6 pt-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-b-[2rem] shrink-0">
                    {step === 1 ? (
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full px-6 py-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-sm tracking-wide"
                        >
                            Cancelar
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                disabled={isGenerating}
                                className="flex-1 px-6 py-4 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50 text-sm tracking-wide"
                            >
                                Atrás
                            </button>
                            <button
                                type="submit"
                                form="content-form"
                                disabled={isGenerating}
                                className={`flex-[2] px-6 py-4 bg-gradient-to-r ${gradientClass} text-white rounded-2xl font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin text-white/80" />
                                        <span className="animate-pulse">Generando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        <span>Generar</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateContentModal;
