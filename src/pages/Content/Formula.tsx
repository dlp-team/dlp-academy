// src/pages/Content/Formula.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calculator, List, ArrowUp } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { canUserAccessSubject } from '../../utils/subjectAccessUtils';

import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

const cleanMath = (math: any) => {
    if (typeof math !== 'string') return '';
    let cleaned = math.trim();
    if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) return cleaned.slice(2, -2).trim();
    if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) return cleaned.slice(2, -2).trim();
    if (cleaned.startsWith('$') && cleaned.endsWith('$')) return cleaned.slice(1, -1).trim();
    return cleaned;
};

const Formula = ({ user }: any) => {
    const { subjectId, topicId, fileId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [sections, setSections] = useState<any[]>([]);
    const [topicGradient, setTopicGradient] = useState('from-indigo-500 to-purple-600');
    const [isGridMode, setIsGridMode] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const total = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            setScrollProgress(total > 0 ? document.documentElement.scrollTop / total : 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!fileId) return;
            try {
                setLoading(true);

                if (subjectId) {
                    const subjectSnap = await getDoc(doc(db, 'subjects', subjectId));
                    if (subjectSnap.exists()) {
                        const subjectData = subjectSnap.data();

                        if (user?.uid) {
                            const hasSubjectAccess = await canUserAccessSubject({
                                subject: { id: subjectSnap.id, ...subjectData },
                                user
                            });

                            if (!hasSubjectAccess) {
                                navigate('/home');
                                return;
                            }
                        }

                        const color = subjectData.color;
                        if (color) setTopicGradient(color);
                    }
                }

                const guideSnap = await getDoc(doc(db, 'resumen', fileId));
                if (guideSnap.exists()) {
                    const data = guideSnap.data();
                    setTitle(data.title || 'Formulario');
                    let parsed: any[] = [];
                    if (typeof data.studyGuide === 'string') {
                        parsed = JSON.parse(data.studyGuide);
                    } else if (Array.isArray(data.studyGuide)) {
                        parsed = data.studyGuide;
                    }
                    setSections(parsed.filter((s: any) => s.formulas?.length > 0));
                }
            } catch (err) {
                console.error('Error loading formulas:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [subjectId, fileId, navigate, user]);

    const totalFormulas = sections.reduce((sum, s) => sum + (s.formulas?.length || 0), 0);

    const handleGoBack = () => {
        navigate(`/home/subject/${subjectId}/topic/${topicId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (sections.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
                <Calculator className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">No hay fórmulas en esta guía</p>
                <button onClick={handleGoBack} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Volver</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Scroll progress */}
            <div className="fixed top-0 left-0 right-0 h-1.5 z-50 bg-slate-200/50 dark:bg-slate-800/50">
                <div className={`h-full bg-gradient-to-r ${topicGradient} transition-all duration-150`} style={{ width: `${scrollProgress * 100}%` }} />
            </div>

            {/* Sticky header */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-700/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button onClick={handleGoBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </button>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${topicGradient} flex items-center justify-center`}>
                        <Calculator className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="font-black text-slate-900 dark:text-white text-lg truncate">Formulario Completo</h1>
                </div>
            </div>

            {/* Main content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-20">
                {/* Hero */}
                <div className="relative mb-16">
                    <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[3rem] blur-3xl opacity-20`} />
                    <div className="relative bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border-2 border-white/80 dark:bg-slate-900/90 dark:border-slate-700/80 overflow-hidden">
                        <div className={`h-2 bg-gradient-to-r ${topicGradient}`} />
                        <div className="p-12 md:p-16 text-center">
                            <div className="mb-8 flex justify-center">
                                <div className={`relative w-24 h-24 lg:w-28 lg:h-28 rounded-[2rem] bg-gradient-to-br ${topicGradient} flex items-center justify-center text-white shadow-2xl ring-8 ring-white dark:ring-slate-800`}>
                                    <Calculator className="w-12 h-12 lg:w-14 lg:h-14" />
                                </div>
                            </div>
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
                                Formulario Completo
                            </h2>
                            <p className={`text-xl lg:text-2xl font-bold bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent mb-8`}>
                                {title}
                            </p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-50 to-white rounded-full border-2 border-slate-200 shadow-lg dark:from-slate-800 dark:to-slate-900 dark:border-slate-700">
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${topicGradient} animate-pulse`} />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{totalFormulas} fórmulas totales</span>
                                </div>
                                <button
                                    onClick={() => setIsGridMode(!isGridMode)}
                                    className={`px-6 py-3 rounded-full border-2 shadow-lg font-bold text-sm transition-all duration-500 hover:scale-105 ${
                                        isGridMode
                                            ? `bg-gradient-to-r ${topicGradient} text-white border-transparent`
                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {isGridMode ? (
                                            <><div className="w-4 h-4 grid grid-cols-2 gap-0.5"><div className="bg-white rounded-sm" /><div className="bg-white rounded-sm" /><div className="bg-white rounded-sm" /><div className="bg-white rounded-sm" /></div><span>Vista Grid</span></>
                                        ) : (
                                            <><List className="w-4 h-4" /><span>Vista Lista</span></>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formulas */}
                {isGridMode ? (
                    <div className="max-w-[1400px] mx-auto space-y-10">
                        {sections.map((section, sIdx: any) => (
                            <div key={sIdx}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="relative shrink-0">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-xl blur-md opacity-50`} />
                                        <div className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${topicGradient} flex items-center justify-center text-white font-black text-sm shadow-lg ring-2 ring-white dark:ring-slate-800`}>
                                            {sIdx + 1}
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                                        {section.title}
                                    </h3>
                                    <div className={`flex-1 h-px bg-gradient-to-r ${topicGradient} opacity-20 rounded-full`} />
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">
                                        {section.formulas.length} {section.formulas.length === 1 ? 'fórmula' : 'fórmulas'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {section.formulas.map((formula, fIdx: any) => (
                                        <div key={fIdx} className="group/formula relative text-left w-fit">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-2xl blur-xl opacity-0 group-hover/formula:opacity-25 transition-opacity duration-500`} />
                                            <div className="relative bg-white rounded-2xl border-2 border-slate-100 group-hover/formula:border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:group-hover/formula:border-slate-600 group-hover/formula:shadow-xl transition-all duration-300 group-hover/formula:-translate-y-1">
                                                <div className={`h-1.5 w-full bg-gradient-to-r ${topicGradient} shrink-0`} />
                                                <div className="flex items-center justify-center px-5 py-7">
                                                    <div className="overflow-x-auto custom-scrollbar py-4 px-4">
                                                        <BlockMath math={cleanMath(formula)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6 max-w-5xl mx-auto">
                        {sections.map((section, sIdx: any) => (
                            <div key={sIdx} className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-xl blur-md opacity-50`} />
                                        <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${topicGradient} flex items-center justify-center text-white font-black text-lg shadow-xl ring-4 ring-white dark:ring-slate-800`}>
                                            {sIdx + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">
                                            {section.title}
                                        </h3>
                                        <div className={`h-1 w-16 bg-gradient-to-r ${topicGradient} rounded-full shadow-md`} />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-2">
                                    {section.formulas.map((formula, fIdx: any) => (
                                        <div key={fIdx} className="group/item relative overflow-visible">
                                            <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} rounded-3xl blur-2xl opacity-0 group-hover/item:opacity-15 transition-opacity duration-700`} />
                                            <div className="relative bg-gradient-to-br from-white via-slate-50/80 to-white backdrop-blur-2xl rounded-3xl p-8 border-2 border-white shadow-xl group-hover/item:shadow-2xl dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 dark:border-slate-700 transition-all duration-500 overflow-visible">
                                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${topicGradient} opacity-5 rounded-bl-[4rem]`} />
                                                <div className="overflow-x-auto custom-scrollbar py-4 relative z-10 text-center px-2">
                                                    <BlockMath math={cleanMath(formula)} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Back to top */}
                <div className="pt-16 pb-10 text-center">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className={`px-8 py-4 bg-gradient-to-r ${topicGradient} text-white rounded-2xl shadow-xl hover:shadow-2xl font-bold transition-all duration-500 hover:-translate-y-1 flex items-center gap-3 mx-auto`}
                    >
                        <ArrowUp className="w-5 h-5" />
                        <span>Volver al Inicio</span>
                    </button>
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(241,245,249,0.5); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #6366f1, #8b5cf6); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #4f46e5, #7c3aed); }
                .dark .custom-scrollbar::-webkit-scrollbar-track { background: rgba(30,41,59,0.5); }
                .katex { color: #1e293b; }
                .dark .katex { color: #e2e8f0; }
            `}</style>
        </div>
    );
};

export default Formula;
