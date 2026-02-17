import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, BookOpen, Calculator, Share2, 
    MoreVertical, ArrowUp, Sparkles, BookMarked,
    FileText, Lightbulb, ChevronDown, ChevronUp,
    Download, Eye, TrendingUp, Zap, List
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// ==================== CONSTANTS ====================

const COLOR_MAP = {
    blue: '#2563eb',
    indigo: '#4f46e5',
    purple: '#9333ea',
    green: '#16a34a',
    red: '#dc2626',
    orange: '#ea580c',
    amber: '#d97706',
    teal: '#0d9488',
    cyan: '#0891b2',
    pink: '#db2777',
    rose: '#e11d48'
};

// ==================== UTILITY FUNCTIONS ====================

const extractColorFromGradient = (gradient) => {
    if (!gradient) return null;
    const mainColorName = gradient.split(' ')[0].replace('from-', '').split('-')[0];
    return COLOR_MAP[mainColorName] || null;
};

// ==================== UI COMPONENTS ====================

const SmartTextRenderer = ({ text }) => {
    if (!text) return null;

    // EXPLICACIÓN: Esta expresión regular busca patrones matemáticos comunes en tus imágenes:
    // 1. Notación científica (ej: 3,24 \times 10^9)
    // 2. Unidades con exponentes (ej: Nm^2C^-2)
    // 3. Comandos LaTeX sueltos (ej: \alpha, \times)
    // 4. Texto en negrita (**texto**)
    // 5. Fórmulas que SÍ tengan $ (por si acaso)
    
    const regex = /((?:\d+(?:[.,]\d+)?\s*\\times\s*10\^\{?-?\d+\}?)|(?:\b[a-zA-Z]+\^\{?-?\d+\}?(?:[a-zA-Z]+\^\{?-?\d+\}?)*)|(?:\\[a-zA-Z]+)|(?:\$[^\$]+\$)|(?:\*\*.*?\*\*))/g;

    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                if (!part) return null;

                // Detectar si es Matemáticas (contiene \times, ^, \, o está entre $)
                const isMath = 
                    part.includes('\\times') || 
                    part.includes('^') || 
                    (part.startsWith('\\') && !part.includes(' ')) ||
                    (part.startsWith('$') && part.endsWith('$'));

                if (isMath) {
                    // Limpiamos los signos $ si existen para que la librería no se confunda
                    const mathContent = part.startsWith('$') ? part.slice(1, -1) : part;
                    return <InlineMath key={index} math={mathContent} />;
                }

                // Detectar Negritas
                if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                        <strong key={index} className="text-slate-900 font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text">
                            {part.slice(2, -2)}
                        </strong>
                    );
                }

                // Texto Normal
                return <span key={index}>{part}</span>;
            })}
        </>
    );
};

const RichTextRenderer = ({ text, topicGradient }) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
        <div className="space-y-5 text-slate-700 leading-[1.8] text-base lg:text-lg">
            {lines.map((line, i) => {
                const cleanLine = line.trim();
                if (!cleanLine) return null;

                // Renderizar viñetas (bullets)
                if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
                    return (
                        <div key={i} className="flex items-start gap-4 pl-2 group/bullet">
                            <div className="relative mt-2.5">
                                <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} rounded-full blur-md opacity-60 group-hover/bullet:opacity-100 transition-opacity duration-500`} />
                                <div className={`relative w-2 h-2 rounded-full bg-gradient-to-br ${topicGradient} ring-4 ring-white shadow-lg group-hover/bullet:scale-150 transition-all duration-500`} />
                            </div>
                            <p className="flex-1 text-slate-700 group-hover/bullet:text-slate-900 transition-colors duration-300">
                                <SmartTextRenderer text={cleanLine.substring(1).trim()} />
                            </p>
                        </div>
                    );
                }

                // Renderizar subtítulos
                if (cleanLine.endsWith(':') && cleanLine.length < 80) {
                    return (
                        <div key={i} className="mt-10 mb-6 group/subtitle">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={`absolute inset-0 bg-gradient-to-b ${topicGradient} rounded-full blur-xl opacity-50 group-hover/subtitle:opacity-70 transition-opacity duration-500`} />
                                    <div className={`relative w-1.5 h-10 rounded-full bg-gradient-to-b ${topicGradient} shadow-xl group-hover/subtitle:h-14 group-hover/subtitle:scale-110 transition-all duration-500`} />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent group-hover/subtitle:scale-[1.02] transition-transform duration-500 origin-left inline-block`}>
                                        <SmartTextRenderer text={cleanLine} />
                                    </h4>
                                    <div className={`mt-3 h-1 w-28 bg-gradient-to-r ${topicGradient} opacity-50 rounded-full shadow-lg group-hover/subtitle:w-40 transition-all duration-500`} />
                                </div>
                            </div>
                        </div>
                    );
                }

                // Párrafos normales
                return (
                    <p key={i} className="leading-[1.8] text-slate-700">
                        <SmartTextRenderer text={cleanLine} />
                    </p>
                );
            })}
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <div className="relative z-10">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-40 animate-pulse" />
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50">
                    <BookOpen className="w-16 h-16 text-indigo-600 animate-pulse mb-2" />
                </div>
            </div>
            <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-full shadow-xl border border-white/50">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce delay-200" />
                    </div>
                    <p className="text-slate-700 text-lg font-bold">Preparando tu experiencia</p>
                </div>
            </div>
        </div>
    </div>
);

const SectionCard = ({ section, index, topicGradient, totalSections, isExpanded, onToggle, isActive, scrollToFormulas }) => {
    return (
        <article 
            id={`section-${index}`}
            className="group/section relative"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[2.5rem] blur-3xl opacity-0 group-hover/section:opacity-15 transition-opacity duration-700`} />
            
            <div className="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border-2 border-white/80 overflow-hidden transition-all duration-500 group-hover/section:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.3)]">
                <div className="relative h-2 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient}`} />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                </div>
                
                <div className={`absolute top-0 right-0 w-[32rem] h-[32rem] bg-gradient-to-br ${topicGradient} rounded-full blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2`} />
                <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${topicGradient} rounded-full blur-3xl opacity-5 translate-y-1/2 -translate-x-1/2`} />
                
                <div className="relative p-8 md:p-10 lg:p-12">
                    <button
                        onClick={onToggle}
                        className="w-full flex items-start gap-5 lg:gap-6 mb-8 group/header"
                    >
                        <div className="relative shrink-0">
                            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-3xl blur-xl opacity-50 group-hover/header:opacity-70 transition-opacity duration-500`} />
                            <div className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-3xl flex items-center justify-center text-white font-black text-2xl lg:text-3xl shadow-2xl bg-gradient-to-br ${topicGradient} ring-4 ring-white transform group-hover/header:scale-110 group-hover/header:rotate-3 transition-all duration-500`}>
                                {index + 1}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 lg:w-9 lg:h-9 bg-white rounded-xl shadow-xl flex items-center justify-center border-2 border-slate-100 transform group-hover/header:scale-110 transition-transform duration-300">
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 text-slate-700" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-700" />
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 shadow-sm">
                                    Capítulo {index + 1} de {totalSections}
                                </span>
                            </div>
                            <h3 className={`text-2xl md:text-3xl lg:text-4xl font-black leading-tight transition-all duration-500 ${
                                isActive 
                                    ? `bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent` 
                                    : 'text-slate-900 group-hover/header:bg-gradient-to-r group-hover/header:' + topicGradient + ' group-hover/header:bg-clip-text group-hover/header:text-transparent'
                            }`}>
                                {section.title}
                            </h3>
                            <div className={`mt-3 h-1.5 w-20 bg-gradient-to-r ${topicGradient} rounded-full shadow-lg group-hover/header:w-32 transition-all duration-500`} />
                        </div>
                    </button>

                    {isExpanded && (
                        <div className="animate-in slide-in-from-top-6 duration-700 fade-in">
                            <div className="relative pl-8 md:pl-10 lg:pl-12">
                                <div className="absolute left-0 top-0 bottom-0 w-2 rounded-full overflow-hidden">
                                    <div className={`absolute inset-0 bg-gradient-to-b ${topicGradient} opacity-30`} />
                                    <div className={`absolute inset-0 bg-gradient-to-b ${topicGradient} opacity-50 animate-pulse`} />
                                </div>
                                <RichTextRenderer text={section.content} topicGradient={topicGradient} />
                            </div>

                            {/* Fórmulas integradas directamente en la sección */}
                            {section.formulas && section.formulas.length > 0 && (
                                <div className="mt-10 space-y-4 pl-8 md:pl-10 lg:pl-12">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-2xl blur-lg opacity-50`} />
                                            <div className={`relative p-3.5 rounded-2xl bg-gradient-to-br ${topicGradient} shadow-2xl`}>
                                                <Calculator className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-wider mb-1">
                                                Fórmulas Clave
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${topicGradient}`} />
                                                <p className="text-sm text-slate-600 font-bold">
                                                    {section.formulas.length} {section.formulas.length === 1 ? 'fórmula esencial' : 'fórmulas esenciales'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {section.formulas.map((formula, fIdx) => (
                                        <div key={fIdx} className="group/item relative overflow-visible">
                                            <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} rounded-3xl blur-2xl opacity-0 group-hover/item:opacity-15 transition-opacity duration-700`} />
                                            
                                            <div className="relative bg-gradient-to-br from-white via-slate-50/80 to-white backdrop-blur-2xl rounded-3xl p-8 border-2 border-white shadow-xl group-hover/item:shadow-2xl transition-all duration-500 overflow-visible">
                                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${topicGradient} opacity-5 rounded-bl-[4rem]`} />
                                                <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${topicGradient} opacity-5 rounded-tr-[3rem]`} />
                                                
                                                <div className="overflow-x-auto py-4 relative z-10">
                                                    <BlockMath math={typeof formula === 'string' ? formula : ""} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

const TableOfContents = ({ sections, topicGradient, onNavigate, activeSection, isScrolled, isMouseAtTop, setKeepHeaderVisible }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setKeepHeaderVisible(isOpen);
    }, [isOpen, setKeepHeaderVisible]);

    return (
        <div className={`fixed left-0 right-0 z-30 px-6 lg:px-8 transition-all duration-500 ${
            isScrolled && !isMouseAtTop && !isOpen ? '-translate-y-full opacity-0' : isScrolled ? 'top-[4.5rem] translate-y-0 opacity-100' : 'top-[5.5rem] translate-y-0 opacity-100'
        }`}>
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full group/toc relative"
                >
                    <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} rounded-3xl blur-xl opacity-0 group-hover/toc:opacity-20 transition-opacity duration-500`} />
                    
                    <div className={`relative bg-white/95 backdrop-blur-2xl rounded-3xl border-2 border-white shadow-xl group-hover/toc:shadow-2xl transition-all duration-500 flex items-center justify-between ${
                        isScrolled ? 'p-3 scale-95' : 'p-5 scale-100'
                    }`}>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-2xl blur-lg opacity-50`} />
                                <div className={`relative rounded-2xl bg-gradient-to-br ${topicGradient} shadow-xl transform group-hover/toc:scale-110 group-hover/toc:rotate-6 transition-all duration-500 ${
                                    isScrolled ? 'p-2' : 'p-3'
                                }`}>
                                    <BookMarked className={`text-white transition-all duration-300 ${
                                        isScrolled ? 'w-5 h-5' : 'w-6 h-6'
                                    }`} />
                                </div>
                            </div>
                            <div className="text-left">
                                <h3 className={`font-black text-slate-900 transition-all duration-300 ${
                                    isScrolled ? 'text-sm mb-0' : 'text-base mb-1'
                                }`}>Navegación Premium</h3>
                                {!isScrolled && (
                                    <div className="flex items-center gap-2 animate-in fade-in duration-300">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${topicGradient}`} />
                                        <p className="text-sm text-slate-600 font-bold">{sections.length} capítulos disponibles</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`rounded-xl bg-slate-100 group-hover/toc:bg-slate-200 transition-all duration-300 ${
                            isScrolled ? 'p-2' : 'p-2.5'
                        }`}>
                            {isOpen ? (
                                <ChevronUp className={`text-slate-700 transition-all duration-300 ${
                                    isScrolled ? 'w-4 h-4' : 'w-5 h-5'
                                }`} />
                            ) : (
                                <ChevronDown className={`text-slate-700 transition-all duration-300 ${
                                    isScrolled ? 'w-4 h-4' : 'w-5 h-5'
                                }`} />
                            )}
                        </div>
                    </div>
                </button>

                {isOpen && (
                    <div className="mt-4 bg-white/95 backdrop-blur-2xl rounded-3xl p-5 border-2 border-white shadow-xl animate-in slide-in-from-top-4 duration-500">
                        <div className="space-y-2 max-h-[32rem] overflow-y-auto custom-scrollbar">
                            {sections.map((section, idx) => {
                                const isActive = activeSection === idx;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            onNavigate(`section-${idx}`);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 text-left group/item relative overflow-hidden ${
                                            isActive ? 'bg-slate-50 shadow-lg scale-[1.02]' : 'hover:bg-slate-50 hover:shadow-md'
                                        }`}
                                    >
                                        {isActive && (
                                            <>
                                                <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} opacity-10`} />
                                                <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} opacity-5 animate-pulse`} />
                                            </>
                                        )}
                                        
                                        <div className={`relative w-10 h-10 rounded-xl text-white text-sm font-bold flex items-center justify-center shrink-0 transition-all duration-500 shadow-lg ${
                                            isActive 
                                                ? `bg-gradient-to-br ${topicGradient} scale-110 shadow-xl ring-4 ring-white` 
                                                : 'bg-gradient-to-br from-slate-700 to-slate-900 group-hover/item:scale-105'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <span className={`relative text-sm font-bold line-clamp-2 transition-all duration-300 ${
                                                isActive 
                                                    ? `bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent` 
                                                    : 'text-slate-700 group-hover/item:text-slate-900'
                                            }`}>
                                                {section.title}
                                            </span>
                                            {isActive && (
                                                <div className={`mt-2 h-1 w-16 bg-gradient-to-r ${topicGradient} rounded-full shadow-sm`} />
                                            )}
                                        </div>

                                        {isActive && (
                                            <div className="px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                                                <span className="text-xs font-bold text-emerald-700">Actual</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                            
                            <div className="my-3 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                            
                            <button
                                onClick={() => {
                                    onNavigate('formulas-section');
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-500 text-left group/item relative overflow-hidden hover:bg-slate-50 hover:shadow-md"
                            >
                                <div className={`relative w-10 h-10 rounded-xl text-white text-sm font-bold flex items-center justify-center shrink-0 transition-all duration-500 shadow-lg bg-gradient-to-br ${topicGradient} group-hover/item:scale-105`}>
                                    <Calculator className="w-5 h-5" />
                                </div>
                                
                                <div className="flex-1">
                                    <span className="relative text-sm font-bold transition-all duration-300 text-slate-700 group-hover/item:text-slate-900">
                                        Formulario Completo
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

const StudyGuide = () => {
    const { subjectId, topicId, guideId, fileId } = useParams(); 
    const activeDocId = fileId || guideId;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [guideData, setGuideData] = useState(null);
    const [topicGradient, setTopicGradient] = useState('from-indigo-500 to-purple-600');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeSection, setActiveSection] = useState(0);
    const [expandedSections, setExpandedSections] = useState({});
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMouseAtTop, setIsMouseAtTop] = useState(true);
    const [keepHeaderVisible, setKeepHeaderVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
            setScrollProgress(scroll);
            setIsScrolled(totalScroll > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setIsMouseAtTop(e.clientY < 200);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (!guideData?.studyGuide) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    const sectionIndex = parseInt(sectionId.split('-')[1]);
                    setActiveSection(sectionIndex);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        guideData.studyGuide.forEach((_, idx) => {
            const element = document.getElementById(`section-${idx}`);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [guideData]);

    useEffect(() => {
        const loadData = async () => {
            if (!activeDocId) return;

            try {
                try {
                    const topicRef = doc(db, "subjects", subjectId, "topics", topicId);
                    const topicSnap = await getDoc(topicRef);
                    if (topicSnap.exists()) {
                        const tData = topicSnap.data();
                        if (tData.color) {
                            setTopicGradient(tData.color);
                        }
                    }
                } catch (err) {
                    console.log("Tema no encontrado, usando colores por defecto");
                }

                const guideRef = doc(db, "subjects", subjectId, "topics", topicId, "resumen", activeDocId);
                const guideSnap = await getDoc(guideRef);

                if (guideSnap.exists()) {
                    const rawData = guideSnap.data();
                    let parsedStudyGuide = [];
                    
                    try {
                        if (typeof rawData.studyGuide === 'string') {
                            parsedStudyGuide = JSON.parse(rawData.studyGuide);
                        } else if (Array.isArray(rawData.studyGuide)) {
                            parsedStudyGuide = rawData.studyGuide;
                        }
                    } catch (e) {
                        console.error("Error al parsear la guía:", e);
                    }

                    setGuideData({
                        ...rawData,
                        studyGuide: parsedStudyGuide
                    });

                    const initialExpanded = {};
                    parsedStudyGuide.forEach((_, idx) => {
                        initialExpanded[idx] = true;
                    });
                    setExpandedSections(initialExpanded);
                }
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };

        if (subjectId && topicId && activeDocId) {
            loadData();
        }
    }, [subjectId, topicId, activeDocId]);

    const handleGoBack = () => navigate(-1);
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerHeight = 80;
            const tocHeight = isScrolled ? 80 : 120;
            const offset = headerHeight + tocHeight + 20;
            
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };
    
    const scrollToFormulas = () => scrollToSection('formulas-section');
    
    const toggleAllSections = () => {
        const allExpanded = Object.values(expandedSections).every(val => val);
        const newState = {};
        Object.keys(expandedSections).forEach(key => {
            newState[key] = !allExpanded;
        });
        setExpandedSections(newState);
    };

    const toggleSection = (index) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const totalFormulas = useMemo(() => {
        if (!guideData?.studyGuide) return 0;
        return guideData.studyGuide.reduce((acc, section) => {
            return acc + (section.formulas?.length || 0);
        }, 0);
    }, [guideData]);

    const allExpanded = Object.values(expandedSections).every(val => val);

    if (loading) return <LoadingSpinner />;

    if (!guideData || !Array.isArray(guideData.studyGuide)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 flex flex-col items-center justify-center text-slate-400 p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-2xl">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-[2.5rem] blur-2xl opacity-30" />
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-12 shadow-2xl border-2 border-white">
                            <BookOpen className="w-20 h-20 mx-auto text-slate-300 mb-4" />
                        </div>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Contenido No Disponible</h2>
                    <p className="text-lg text-slate-600 font-medium mb-8 leading-relaxed">
                        No se pudo cargar la guía de estudio. Es posible que este archivo no sea un resumen generado o los datos no estén disponibles en este momento.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {guideData?.url && (
                            <a 
                                href={guideData.url} 
                                target="_blank"
                                rel="noreferrer"
                                className={`px-8 py-4 bg-gradient-to-r ${topicGradient} text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-3`}
                            >
                                <Eye className="w-5 h-5" />
                                Ver Archivo Original
                            </a>
                        )}
                        <button 
                            onClick={handleGoBack} 
                            className="px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-2 border-slate-200"
                        >
                            ← Volver atrás
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 font-sans text-slate-900 pb-24 relative overflow-hidden">
            
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-float-delayed" />
            </div>

            <div className="fixed top-0 left-0 right-0 h-1.5 z-50 bg-slate-200/50 backdrop-blur-sm">
                <div className="relative h-full overflow-hidden">
                    <div 
                        className={`h-full bg-gradient-to-r ${topicGradient} transition-all duration-300 ease-out shadow-2xl relative`}
                        style={{ width: `${scrollProgress * 100}%` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-sm" />
                    </div>
                </div>
            </div>

            <div className={`fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-b-2 border-white/50 shadow-2xl transition-all duration-500 ${
                isScrolled && !isMouseAtTop && !keepHeaderVisible ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}>
                <div className={`max-w-7xl mx-auto px-6 lg:px-8 transition-all duration-500 flex items-center justify-between ${
                    isScrolled ? 'py-2' : 'py-5'
                }`}>
                    <button 
                        onClick={handleGoBack} 
                        className={`group p-2 hover:bg-white/80 rounded-2xl text-slate-600 hover:text-slate-900 transition-all duration-300 shadow-md hover:shadow-lg ${
                            isScrolled ? 'scale-90' : 'scale-100'
                        }`}
                    >
                        <ChevronLeft className={`transform group-hover:-translate-x-1 transition-all duration-300 ${
                            isScrolled ? 'w-5 h-5' : 'w-6 h-6'
                        }`} />
                    </button>
                    
                    <div className="flex-1 text-center mx-6">
                        <h1 className={`font-black text-slate-900 truncate transition-all duration-500 ${
                            isScrolled ? 'text-sm md:text-base mb-0' : 'text-base md:text-lg mb-1'
                        }`}>
                            {guideData.title || "Guía de Estudio Premium"}
                        </h1>
                        {!isScrolled && (
                            <div className="flex items-center justify-center gap-2 animate-in fade-in duration-300">
                                <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${topicGradient}`} />
                                <p className={`text-xs font-bold hidden sm:block truncate transition-all duration-300 bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent`}>
                                    {guideData.studyGuide[activeSection]?.title || ''}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleAllSections}
                            className={`group p-2 hover:bg-white/80 rounded-2xl text-slate-500 hover:text-slate-900 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 ${
                                isScrolled ? 'scale-90' : 'scale-100'
                            }`}
                            title={allExpanded ? 'Recoger todo' : 'Desplegar todo'}
                        >
                            <List className={`transition-all duration-300 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
                            {!isScrolled && (allExpanded ? (
                                <ChevronUp className="w-4 h-4 hidden sm:block" />
                            ) : (
                                <ChevronDown className="w-4 h-4 hidden sm:block" />
                            ))}
                        </button>
                        {guideData.url && (
                            <a
                                href={guideData.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`group p-2 hover:bg-white/80 rounded-2xl text-slate-500 hover:text-slate-900 transition-all duration-300 shadow-md hover:shadow-lg hidden md:block ${
                                    isScrolled ? 'scale-90' : 'scale-100'
                                }`}
                                title="Descargar PDF"
                            >
                                <Download className={`transform group-hover:translate-y-0.5 transition-all duration-300 ${
                                    isScrolled ? 'w-4 h-4' : 'w-5 h-5'
                                }`} />
                            </a>
                        )}
                        <button className={`p-2 hover:bg-white/80 rounded-2xl text-slate-500 hover:text-slate-900 transition-all duration-300 shadow-md hover:shadow-lg ${
                            isScrolled ? 'scale-90' : 'scale-100'
                        }`}>
                            <MoreVertical className={`transition-all duration-300 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
                        </button>
                    </div>
                </div>
            </div>

            <TableOfContents 
                sections={guideData.studyGuide} 
                topicGradient={topicGradient}
                onNavigate={scrollToSection}
                activeSection={activeSection}
                isScrolled={isScrolled}
                isMouseAtTop={isMouseAtTop}
                setKeepHeaderVisible={setKeepHeaderVisible}
            />

            <main className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-8 space-y-12 transition-all duration-500 ${
                isScrolled ? 'pt-48' : 'pt-56'
            }`}>
                
                <div className="relative group/hero">
                    <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[3rem] blur-3xl opacity-20 group-hover/hero:opacity-30 transition-opacity duration-700`} />
                    
                    <div className="relative bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border-2 border-white/80 overflow-hidden">
                        <div className="relative h-2 overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient}`} />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        </div>
                        
                        <div className={`absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br ${topicGradient} rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2`} />
                        <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${topicGradient} rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2`} />
                        
                        <div className="relative p-12 md:p-16 lg:p-20 text-center">
                            <div className="mb-10 flex justify-center">
                                <div className="relative group/icon">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[2rem] blur-2xl opacity-50 group-hover/icon:opacity-70 transition-opacity duration-500`} />
                                    <div className={`relative w-28 h-28 lg:w-32 lg:h-32 rounded-[2rem] bg-gradient-to-br ${topicGradient} flex items-center justify-center text-white shadow-2xl ring-8 ring-white transform group-hover/icon:scale-110 group-hover/icon:rotate-6 transition-all duration-500`}>
                                        <BookOpen className="w-14 h-14 lg:w-16 lg:h-16" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1] max-w-5xl mx-auto">
                                {guideData.title}
                            </h2>
                            <p className={`text-xl lg:text-3xl font-bold mb-12 bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent`}>
                                {guideData.subtitle}
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-5 lg:gap-6">
                                <div className="group px-8 py-6 lg:px-10 lg:py-7 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl border-2 border-white/80 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${topicGradient} shadow-lg`}>
                                            <FileText className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-3xl lg:text-4xl font-black text-slate-900">{guideData.studyGuide.length}</div>
                                            <div className="text-xs lg:text-sm text-slate-600 uppercase font-bold tracking-wider">Capítulos</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={() => scrollToSection('formulas-section')}
                                    className="group px-8 py-6 lg:px-10 lg:py-7 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl border-2 border-white/80 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${topicGradient} shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                            <Calculator className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-3xl lg:text-4xl font-black text-slate-900">{totalFormulas}</div>
                                            <div className="text-xs lg:text-sm text-slate-600 uppercase font-bold tracking-wider">Fórmulas</div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                                        Ver todo →
                                    </div>
                                </button>

                                <div className="group px-8 py-6 lg:px-10 lg:py-7 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl border-2 border-white/80 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg`}>
                                            <TrendingUp className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-3xl lg:text-4xl font-black text-slate-900">A+</div>
                                            <div className="text-xs lg:text-sm text-slate-600 uppercase font-bold tracking-wider">Calidad</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {guideData.url && (
                                <div className="mt-10">
                                    <a 
                                        href={guideData.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className={`group inline-flex items-center gap-3 lg:gap-4 px-10 py-5 lg:px-12 lg:py-6 bg-gradient-to-r ${topicGradient} text-white rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-2 font-bold text-base lg:text-lg relative overflow-hidden`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                                        <Share2 className="w-5 h-5 lg:w-6 lg:h-6 relative z-10 transform group-hover:rotate-12 transition-transform duration-500" />
                                        <span className="relative z-10">Ver Documento Original</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    {guideData.studyGuide.map((section, idx) => (
                        <SectionCard
                            key={idx}
                            section={section}
                            index={idx}
                            topicGradient={topicGradient}
                            totalSections={guideData.studyGuide.length}
                            isExpanded={expandedSections[idx]}
                            onToggle={() => toggleSection(idx)}
                            isActive={activeSection === idx}
                            scrollToFormulas={scrollToFormulas}
                        />
                    ))}
                </div>

                {totalFormulas > 0 && (
                    <div id="formulas-section" className="relative group/formulas scroll-mt-48">
                        <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[3rem] blur-3xl opacity-20 group-hover/formulas:opacity-30 transition-opacity duration-700`} />
                        
                        <div className="relative bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl border-2 border-white/80 overflow-hidden">
                            <div className="relative h-2 overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient}`} />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                            </div>
                            
                            <div className={`absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br ${topicGradient} rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2`} />
                            <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${topicGradient} rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2`} />
                            
                            <div className="relative p-12 md:p-16 lg:p-20">
                                <div className="text-center mb-12">
                                    <div className="mb-8 flex justify-center">
                                        <div className="relative group/icon">
                                            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[2rem] blur-2xl opacity-50 group-hover/icon:opacity-70 transition-opacity duration-500`} />
                                            <div className={`relative w-24 h-24 lg:w-28 lg:h-28 rounded-[2rem] bg-gradient-to-br ${topicGradient} flex items-center justify-center text-white shadow-2xl ring-8 ring-white transform group-hover/icon:scale-110 group-hover/icon:rotate-6 transition-all duration-500`}>
                                                <Calculator className="w-12 h-12 lg:w-14 lg:h-14" />
                                            </div>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                                        Formulario Completo
                                    </h2>
                                    <p className={`text-xl lg:text-2xl font-bold bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent mb-8`}>
                                        Todas las fórmulas en un solo lugar
                                    </p>
                                    <div className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-50 to-white rounded-full border-2 border-slate-200 shadow-lg inline-flex">
                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${topicGradient} animate-pulse`} />
                                        <span className="text-sm font-bold text-slate-700">{totalFormulas} fórmulas totales</span>
                                    </div>
                                </div>

                                <div className="space-y-6 max-w-5xl mx-auto">
                                    {guideData.studyGuide.map((section, sectionIdx) => {
                                        if (!section.formulas || section.formulas.length === 0) return null;
                                        
                                        return (
                                            <div key={sectionIdx} className="space-y-4">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="relative">
                                                        <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-xl blur-md opacity-50`} />
                                                        <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${topicGradient} flex items-center justify-center text-white font-black text-lg shadow-xl ring-4 ring-white`}>
                                                            {sectionIdx + 1}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-1">
                                                            {section.title}
                                                        </h3>
                                                        <div className={`h-1 w-16 bg-gradient-to-r ${topicGradient} rounded-full shadow-md`} />
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4 pt-2">
                                                    {section.formulas.map((formula, formulaIdx) => (
                                                        <button
                                                            key={formulaIdx}
                                                            onClick={() => scrollToSection(`section-${sectionIdx}`)}
                                                            className="w-full group/item relative overflow-visible cursor-pointer"
                                                        >
                                                            <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} rounded-3xl blur-2xl opacity-0 group-hover/item:opacity-15 transition-opacity duration-700`} />
                                                            
                                                            <div className="relative bg-gradient-to-br from-white via-slate-50/80 to-white backdrop-blur-2xl rounded-3xl p-8 border-2 border-white shadow-xl group-hover/item:shadow-2xl transition-all duration-500 overflow-visible">
                                                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${topicGradient} opacity-5 rounded-bl-[4rem]`} />
                                                                <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${topicGradient} opacity-5 rounded-tr-[3rem]`} />
                                                                
                                                                <div className="overflow-x-auto py-4 relative z-10">
                                                                    <BlockMath math={typeof formula === 'string' ? formula : ""} />
                                                                </div>
                                                                
                                                                <div className="absolute bottom-4 right-4 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                                                                    <span className="text-xs font-bold text-slate-400">Ir a: {section.title} →</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-16 pb-10 text-center">
                    <div className="relative inline-flex flex-col items-center gap-6 p-12 group/footer">
                        <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[2.5rem] blur-3xl opacity-20 group-hover/footer:opacity-30 transition-opacity duration-700`} />
                        
                        <div className="relative bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-12 shadow-2xl border-2 border-white/80">
                            <div className="relative mb-6">
                                <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-3xl blur-xl opacity-50`} />
                                <div className={`relative p-5 rounded-3xl bg-gradient-to-br ${topicGradient} shadow-xl transform group-hover/footer:scale-110 group-hover/footer:rotate-12 transition-all duration-500`}>
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-900 font-black text-xl mb-2">
                                    ¡Felicitaciones por Completar el Recorrido!
                                </p>
                                <p className="text-base text-slate-600 font-medium max-w-md mb-8">
                                    Has explorado todos los capítulos de esta guía premium. Revisa el contenido cuando lo necesites.
                                </p>
                                <button 
                                    onClick={scrollToTop}
                                    className={`group/btn px-8 py-4 bg-gradient-to-r ${topicGradient} text-white rounded-2xl shadow-xl hover:shadow-2xl font-bold transition-all duration-500 hover:-translate-y-1 flex items-center gap-3 relative overflow-hidden mx-auto`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700" />
                                    <ArrowUp className="w-5 h-5 relative z-10 transform group-hover/btn:-translate-y-1 transition-transform duration-300" />
                                    <span className="relative z-10">Volver al Inicio</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-30px) rotate(-5deg); }
                }
                
                .animate-shimmer {
                    animation: shimmer 3s infinite;
                }
                
                .animate-float {
                    animation: float 20s ease-in-out infinite;
                }
                
                .animate-float-delayed {
                    animation: float-delayed 25s ease-in-out infinite;
                }
                
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-700 { animation-delay: 700ms; }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(241, 245, 249, 0.5);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #6366f1, #8b5cf6);
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #4f46e5, #7c3aed);
                }
            `}</style>
        </div>
    );
};

export default StudyGuide;