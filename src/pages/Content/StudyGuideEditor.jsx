import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Plus, Trash2, Save, Eye,
    ChevronDown, BookOpen, Calculator, AlertCircle,
    CheckCircle2, Loader2, PenLine, X, Copy, MoveUp, MoveDown,
    LayoutList
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from "../../firebase/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

// ==================== CONSTANTS ====================
const EMPTY_SECTION = () => ({
    title: '',
    content: '',
    formulas: []
});

const TOAST_DURATION = 3500;

// ==================== SUBCOMPONENTS ====================

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, TOAST_DURATION);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 font-bold text-sm transition-all duration-500 animate-in slide-in-from-bottom-4 fade-in ${
            type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
            type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
            'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
            {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
            {type === 'loading' && <Loader2 className="w-5 h-5 text-blue-600 shrink-0 animate-spin" />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const FormulaEditor = ({ formula, index, onUpdate, onDelete, topicGradient, baseColor }) => {
    return (
        <div className="group/formula relative bg-white rounded-2xl border-2 border-slate-100 hover:border-slate-200 shadow-sm transition-all duration-300 overflow-hidden">
            <div className={`h-1 w-full bg-gradient-to-r ${topicGradient}`} />
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Fórmula #{index + 1}</span>
                    <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
                <textarea
                    value={formula}
                    onChange={(e) => onUpdate(e.target.value)}
                    placeholder="Ej: F = m \cdot a"
                    rows={2}
                    className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-${baseColor}-300 focus:border-transparent resize-none transition-all`}
                />
                <div className="py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-center overflow-x-auto">
                    <BlockMath math={formula || '\\text{Escribe LaTeX arriba}'} />
                </div>
            </div>
        </div>
    );
};

const SectionEditor = ({ section, index, total, topicGradient, baseColor, onUpdate, onDelete, onMoveUp, onMoveDown, onDuplicate }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const updateField = (field, value) => onUpdate({ ...section, [field]: value });
    const addFormula = () => onUpdate({ ...section, formulas: [...(section.formulas || []), ''] });
    const updateFormula = (fIdx, value) => {
        const newFormulas = [...(section.formulas || [])];
        newFormulas[fIdx] = value;
        onUpdate({ ...section, formulas: newFormulas });
    };
    const deleteFormula = (fIdx) => {
        const newFormulas = (section.formulas || []).filter((_, i) => i !== fIdx);
        onUpdate({ ...section, formulas: newFormulas });
    };

    return (
        <div className="relative group/section">
            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[2.5rem] blur-2xl opacity-0 group-hover/section:opacity-10 transition-opacity duration-500`} />
            <div className="relative bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 overflow-hidden">
                <div className={`h-1.5 w-full bg-gradient-to-r ${topicGradient}`} />
                <div className="px-6 py-4 flex items-center gap-4">
                    <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${topicGradient} flex items-center justify-center text-white font-black shadow-lg ring-2 ring-white shrink-0`}>
                        {index + 1}
                    </div>
                    <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="Título del capítulo..."
                        className="flex-1 text-lg font-black text-slate-900 bg-transparent border-none outline-none placeholder-slate-300"
                    />
                    <div className="flex items-center gap-1">
                        <button onClick={onMoveUp} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"><MoveUp className="w-4 h-4" /></button>
                        <button onClick={onMoveDown} disabled={index === total - 1} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"><MoveDown className="w-4 h-4" /></button>
                        <button onClick={onDuplicate} className={`p-1.5 text-slate-400 hover:text-${baseColor}-600`}><Copy className="w-4 h-4" /></button>
                        <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-slate-400">
                            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="px-6 pb-6 space-y-5 border-t border-slate-50 pt-5">
                        <textarea
                            value={section.content}
                            onChange={(e) => updateField('content', e.target.value)}
                            placeholder="Escribe el contenido..."
                            rows={6}
                            className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-${baseColor}-300 resize-y transition-all font-mono leading-relaxed`}
                        />
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Calculator className="w-3.5 h-3.5" /> Fórmulas ({section.formulas?.length || 0})
                                </label>
                                <button onClick={addFormula} className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${topicGradient} text-white rounded-lg text-xs font-black shadow-md hover:-translate-y-0.5 transition-all`}>
                                    <Plus className="w-3 h-3" /> Añadir fórmula
                                </button>
                            </div>
                            <div className="space-y-3">
                                {(section.formulas || []).map((f, fi) => (
                                    <FormulaEditor key={fi} formula={f} index={fi} topicGradient={topicGradient} baseColor={baseColor} onUpdate={(v) => updateFormula(fi, v)} onDelete={() => deleteFormula(fi)} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

const StudyGuideEditor = () => {
    const { subjectId, topicId, guideId, fileId } = useParams();
    const activeDocId = fileId || guideId;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [topicGradient, setTopicGradient] = useState('from-indigo-500 to-purple-600');
    const [toast, setToast] = useState(null);

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [sections, setSections] = useState([]);

    const baseColor = useMemo(() => {
        const firstPart = topicGradient.split(' ')[0] || '';
        return firstPart.replace('from-', '').split('-')[0] || 'indigo';
    }, [topicGradient]);

    const goToView = () => {
        if (subjectId && topicId && activeDocId) {
            navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${activeDocId}`);
        } else {
            navigate(-1);
        }
    };

    const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);

    // ---------------------------------------------------------
    // ✅ SEGURIDAD: VERIFICACIÓN DE ROL DE PROFESOR
    // ---------------------------------------------------------
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                // Si no hay usuario, redirigir al login
                navigate('/');
                return;
            }

            try {
                // Verificar rol en Firestore
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    
                    // Si el rol NO es 'teacher', redirigir fuera
                    if (userData.role !== 'teacher') {
                        navigate('/home'); 
                    }
                } else {
                    // Si no existe el documento del usuario, por seguridad fuera
                    navigate('/');
                }
            } catch (error) {
                console.error("Error verificando permisos:", error);
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // ---------------------------------------------------------
    // CARGA DE DATOS DE LA GUÍA
    // ---------------------------------------------------------
    useEffect(() => {
        const load = async () => {
            if (!activeDocId) return;
            try {
                // 1. Cargar color de la SUBJECT
                const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
                if (subjectSnap.exists() && subjectSnap.data().color) {
                    setTopicGradient(subjectSnap.data().color);
                }

                // 2. Cargar guía
                const guideSnap = await getDoc(doc(db, 'subjects', subjectId, 'topics', topicId, 'resumen', activeDocId));
                if (guideSnap.exists()) {
                    const raw = guideSnap.data();
                    setTitle(raw.title || '');
                    setSubtitle(raw.subtitle || '');
                    const content = typeof raw.studyGuide === 'string' ? JSON.parse(raw.studyGuide) : (raw.studyGuide || []);
                    setSections(content);
                }
            } catch (err) {
                showToast('Error al cargar datos', 'error');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [subjectId, topicId, activeDocId, showToast]);

    const handleSave = async () => {
        setSaving(true);
        showToast('Guardando cambios...', 'loading');
        try {
            await setDoc(doc(db, 'subjects', subjectId, 'topics', topicId, 'resumen', activeDocId), {
                title,
                subtitle,
                studyGuide: JSON.stringify(sections),
                updatedAt: new Date().toISOString()
            }, { merge: true });
            showToast('¡Cambios guardados!', 'success');
        } catch (err) {
            showToast('Error al guardar', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 font-bold text-slate-400"><Loader2 className="w-10 h-10 animate-spin" /> Cargando editor...</div>;

    return (
        <div className={`min-h-screen bg-slate-50 pb-32`}>
            {/* HEADER */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-white/60 shadow-xl p-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"><ChevronLeft /></button>
                        <div>
                            <div className="flex items-center gap-2">
                                <PenLine className={`w-4 h-4 text-${baseColor}-500`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Modo Editor</span>
                            </div>
                            <h1 className="font-black text-slate-900 truncate max-w-[200px] sm:max-w-md">{title || 'Sin título'}</h1>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={goToView} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm">
                            <Eye className="w-4 h-4" /> <span>Ver guía</span>
                        </button>
                        <button onClick={handleSave} disabled={saving} className={`px-5 py-2 bg-gradient-to-r ${topicGradient} text-white rounded-xl font-black text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50`}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} <span>Guardar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
                {/* META FIELDS */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 p-8 space-y-6 relative overflow-hidden">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${topicGradient} absolute top-0 left-0`} />
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título de la guía</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-black focus:ring-2 focus:ring-${baseColor}-300 focus:bg-white outline-none transition-all`} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subtítulo</label>
                        <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-${baseColor}-300 focus:bg-white outline-none transition-all`} />
                    </div>
                </div>

                {/* SECTIONS */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-3"><LayoutList className="text-slate-400" /> Capítulos ({sections.length})</h2>
                        <button onClick={() => setSections([...sections, EMPTY_SECTION()])} className={`px-4 py-2 bg-gradient-to-r ${topicGradient} text-white rounded-2xl font-black text-sm shadow-md hover:-translate-y-0.5 transition-all`}>+ Nuevo capítulo</button>
                    </div>
                    <div className="space-y-5">
                        {sections.map((s, i) => (
                            <SectionEditor key={i} section={s} index={i} total={sections.length} topicGradient={topicGradient} baseColor={baseColor}
                                onUpdate={(upd) => setSections(sections.map((sec, idx) => idx === i ? upd : sec))}
                                onDelete={() => setSections(sections.filter((_, idx) => idx !== i))}
                                onMoveUp={() => { if(i > 0) { const a = [...sections]; [a[i], a[i-1]] = [a[i-1], a[i]]; setSections(a); }}}
                                onMoveDown={() => { if(i < sections.length - 1) { const a = [...sections]; [a[i], a[i+1]] = [a[i+1], a[i]]; setSections(a); }}}
                                onDuplicate={() => { const a = [...sections]; a.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(s)), title: s.title + ' (copia)' }); setSections(a); }}
                            />
                        ))}
                    </div>
                </div>

                {/* FINAL SAVE */}
                <div className="flex flex-col items-center gap-4 pt-10">
                    <button onClick={handleSave} disabled={saving} className={`px-10 py-4 bg-gradient-to-r ${topicGradient} text-white rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50`}>
                        {saving ? <Loader2 className="animate-spin" /> : <Save />} Guardar Cambios Finales
                    </button>
                    <button onClick={goToView} className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Ver cómo está quedando
                    </button>
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default StudyGuideEditor;