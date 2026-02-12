import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, BookOpen, Calculator, Share2, 
    MoreVertical, ArrowUp, Sparkles, BookMarked,
    FileText, Lightbulb, ChevronDown, ChevronUp,
    Download, Eye, Hash
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

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

const FormatBold = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <strong key={index} className="text-slate-900 font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return <span key={index}>{part}</span>;
    });
};

const RichTextRenderer = ({ text, topicGradient }) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
        <div className="space-y-4 text-slate-700 leading-relaxed text-base lg:text-lg">
            {lines.map((line, i) => {
                const cleanLine = line.trim();
                if (!cleanLine) return null;

                // Detectar bullet points
                if (cleanLine.startsWith('•') || cleanLine.startsWith('-')) {
                    return (
                        <div key={i} className="flex items-start gap-3 pl-1 group">
                            <div className={`mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${topicGradient} shrink-0 group-hover:scale-150 transition-transform duration-300`} />
                            <p className="flex-1"><FormatBold text={cleanLine.substring(1).trim()} /></p>
                        </div>
                    );
                }

                // Detectar subtítulos (líneas que terminan en :)
                if (cleanLine.endsWith(':') && cleanLine.length < 60) {
                    return (
                        <h4 key={i} className="text-slate-900 font-black text-lg mt-6 mb-2 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-slate-400" />
                            <FormatBold text={cleanLine} />
                        </h4>
                    );
                }

                return (
                    <p key={i} className="leading-relaxed">
                        <FormatBold text={cleanLine} />
                    </p>
                );
            })}
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center">
        <div className="relative">
            <BookOpen className="w-14 h-14 text-indigo-500 animate-pulse mb-4" />
            <div className="absolute inset-0 w-14 h-14 bg-indigo-400 rounded-full blur-2xl opacity-40 animate-pulse" />
        </div>
        <p className="text-slate-600 text-base font-bold animate-pulse">Cargando contenido...</p>
    </div>
);

const FormulaCard = ({ formulas, topicGradient }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!formulas || formulas.length === 0) return null;

    return (
        <div className="mt-8">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 hover:shadow-md transition-all duration-300 mb-3 group"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${topicGradient} shadow-lg`}>
                        <Calculator className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                            Fórmulas Clave
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold">
                            {formulas.length} {formulas.length === 1 ? 'fórmula' : 'fórmulas'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 hidden sm:block">
                        {isExpanded ? 'Ocultar' : 'Mostrar'}
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                    )}
                </div>
            </button>

            {isExpanded && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {formulas.map((formula, fIdx) => (
                        <div 
                            key={fIdx} 
                            className="group relative"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                            <div className="relative bg-gradient-to-br from-white via-slate-50/50 to-white backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                {/* Badge de número */}
                                <div className="absolute -top-2 -left-2 w-7 h-7 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white text-xs font-black flex items-center justify-center shadow-lg">
                                    {fIdx + 1}
                                </div>
                                
                                {/* Decorative corner */}
                                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${topicGradient} opacity-5 rounded-bl-full`} />
                                
                                <div className="overflow-x-auto py-2 relative z-10">
                                    <BlockMath math={typeof formula === 'string' ? formula : ""} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const SectionCard = ({ section, index, topicGradient, totalSections }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <article 
            id={`section-${index}`}
            className="group relative"
        >
            {/* Glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[2rem] blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />
            
            <div className="relative bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-2xl">
                {/* Top accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${topicGradient}`} />
                
                {/* Decorative elements */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${topicGradient} rounded-full blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2`} />
                
                <div className="relative p-6 md:p-8 lg:p-10">
                    {/* Section Header */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-start gap-4 lg:gap-5 mb-6 group/header hover:translate-x-1 transition-transform duration-300"
                    >
                        <div className="relative shrink-0">
                            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-2xl blur-lg opacity-40`} />
                            <div className={`relative w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl lg:text-2xl shadow-xl bg-gradient-to-br ${topicGradient}`}>
                                {index + 1}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 lg:w-7 lg:h-7 bg-white rounded-lg shadow-md flex items-center justify-center">
                                {isExpanded ? (
                                    <ChevronUp className="w-3 h-3 text-slate-600" />
                                ) : (
                                    <ChevronDown className="w-3 h-3 text-slate-600" />
                                )}
                            </div>
                        </div>
                        
                        <div className="flex-1 text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-[0.15em] px-2 py-1 rounded-full bg-slate-100">
                                    Sección {index + 1} de {totalSections}
                                </span>
                            </div>
                            <h3 className={`text-xl md:text-2xl lg:text-3xl font-black text-slate-900 leading-tight bg-gradient-to-r ${topicGradient} group-hover/header:bg-clip-text group-hover/header:text-transparent transition-all duration-300`}>
                                {section.title}
                            </h3>
                        </div>
                    </button>

                    {/* Expandable Content */}
                    {isExpanded && (
                        <div className="animate-in slide-in-from-top-4 duration-500">
                            {/* Content with side border */}
                            <div className="relative pl-6 md:pl-8 lg:pl-10 mb-8">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 lg:w-1.5 rounded-full bg-gradient-to-b ${topicGradient} opacity-30`} />
                                <RichTextRenderer text={section.content} topicGradient={topicGradient} />
                            </div>

                            {/* Formulas */}
                            <FormulaCard 
                                formulas={section.formulas} 
                                topicGradient={topicGradient}
                            />
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

const TableOfContents = ({ sections, topicGradient, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="sticky top-20 z-30 mb-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/90 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-br ${topicGradient}`}>
                        <BookMarked className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-sm font-black text-slate-900">Índice de Contenidos</h3>
                        <p className="text-xs text-slate-500 font-semibold">{sections.length} secciones</p>
                    </div>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                )}
            </button>

            {isOpen && (
                <div className="mt-3 bg-white/90 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-lg animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {sections.map((section, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    onNavigate(`section-${idx}`);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 text-left group/item"
                            >
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${topicGradient} text-white text-sm font-bold flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform`}>
                                    {idx + 1}
                                </div>
                                <span className="text-sm font-bold text-slate-700 group-hover/item:text-slate-900 line-clamp-2 flex-1">
                                    {section.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
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

    // Scroll Progress
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
            setScrollProgress(scroll);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            if (!activeDocId) return;

            try {
                // Load topic for gradient
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

                // Load study guide
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
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const estimatedReadTime = useMemo(() => {
        if (!guideData?.studyGuide) return 0;
        const totalWords = guideData.studyGuide.reduce((acc, section) => {
            return acc + (section.content?.split(' ').length || 0);
        }, 0);
        return Math.ceil(totalWords / 200); // 200 words per minute
    }, [guideData]);

    if (loading) return <LoadingSpinner />;

    if (!guideData || !Array.isArray(guideData.studyGuide)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-400 rounded-full blur-3xl opacity-20" />
                    <div className="relative bg-white rounded-3xl p-8 shadow-xl">
                        <BookOpen className="w-16 h-16 mx-auto text-slate-300" />
                    </div>
                </div>
                <h2 className="text-2xl font-black text-slate-700 mb-3">Contenido no disponible</h2>
                <p className="max-w-md text-slate-500 font-medium mb-6">
                    No se pudo cargar la guía de estudio. Es posible que este archivo no sea un resumen generado.
                </p>
                {guideData?.url && (
                    <a 
                        href={guideData.url} 
                        target="_blank"
                        rel="noreferrer"
                        className={`px-6 py-3 bg-gradient-to-r ${topicGradient} text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2`}
                    >
                        <Eye className="w-5 h-5" />
                        Ver Archivo Original
                    </a>
                )}
                <button 
                    onClick={handleGoBack} 
                    className="mt-4 text-slate-600 font-bold hover:text-slate-900 transition-colors"
                >
                    ← Volver atrás
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 font-sans text-slate-900 pb-20">
            
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-2 z-50 bg-slate-200/30 backdrop-blur-sm">
                <div 
                    className={`h-full bg-gradient-to-r ${topicGradient} transition-all duration-200 ease-out shadow-lg relative`}
                    style={{ width: `${scrollProgress * 100}%` }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-sm" />
                </div>
            </div>

            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
                    <button 
                        onClick={handleGoBack} 
                        className="p-2.5 hover:bg-white rounded-2xl text-slate-600 hover:text-slate-900 transition-all duration-300 group"
                    >
                        <ChevronLeft className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="flex-1 text-center mx-4">
                        <h1 className="text-sm md:text-base font-black text-slate-900 truncate">
                            {guideData.title || "Guía de Estudio"}
                        </h1>
                        <p className="text-xs text-slate-500 font-semibold hidden sm:block">
                            {estimatedReadTime} min lectura
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {guideData.url && (
                            <a
                                href={guideData.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 hover:bg-white rounded-2xl text-slate-500 hover:text-slate-900 transition-all duration-300 group hidden sm:block"
                                title="Descargar PDF"
                            >
                                <Download className="w-5 h-5 transform group-hover:translate-y-0.5 transition-transform" />
                            </a>
                        )}
                        <button className="p-2.5 hover:bg-white rounded-2xl text-slate-500 hover:text-slate-900 transition-all duration-300">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-10">
                
                {/* Hero Section */}
                <div className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-700`} />
                    
                    <div className="relative bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden">
                        <div className={`h-2 bg-gradient-to-r ${topicGradient}`} />
                        
                        {/* Decorative elements */}
                        <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${topicGradient} rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2`} />
                        <div className={`absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr ${topicGradient} rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2`} />
                        
                        <div className="relative p-10 md:p-14 lg:p-16 text-center">
                            <div className="mb-8 flex justify-center">
                                <div className="relative">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-3xl blur-2xl opacity-40`} />
                                    <div className={`relative w-24 h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br ${topicGradient} flex items-center justify-center text-white shadow-2xl`}>
                                        <BookOpen className="w-12 h-12 lg:w-14 lg:h-14" />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-4 tracking-tight leading-tight max-w-4xl mx-auto">
                                {guideData.title}
                            </h2>
                            <p className={`text-xl lg:text-2xl font-bold mb-8 bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent`}>
                                {guideData.subtitle}
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
                                <div className="px-6 py-4 lg:px-8 lg:py-5 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" />
                                        <div className="text-left">
                                            <div className="text-2xl lg:text-3xl font-black text-slate-900">{guideData.studyGuide.length}</div>
                                            <div className="text-[10px] lg:text-xs text-slate-500 uppercase font-bold tracking-wider">Secciones</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="px-6 py-4 lg:px-8 lg:py-5 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <Lightbulb className="w-5 h-5 lg:w-6 lg:h-6 text-slate-600" />
                                        <div className="text-left">
                                            <div className="text-2xl lg:text-3xl font-black text-slate-900">{estimatedReadTime}</div>
                                            <div className="text-[10px] lg:text-xs text-slate-500 uppercase font-bold tracking-wider">Minutos</div>
                                        </div>
                                    </div>
                                </div>

                                {guideData.url && (
                                    <a 
                                        href={guideData.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className={`px-6 py-4 lg:px-8 lg:py-5 bg-gradient-to-r ${topicGradient} text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 lg:gap-3 font-bold text-sm lg:text-base`}
                                    >
                                        <Share2 className="w-4 h-4 lg:w-5 lg:h-5" />
                                        Ver Original
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table of Contents */}
                <TableOfContents 
                    sections={guideData.studyGuide} 
                    topicGradient={topicGradient}
                    onNavigate={scrollToSection}
                />

                {/* Sections */}
                <div className="space-y-8">
                    {guideData.studyGuide.map((section, idx) => (
                        <SectionCard
                            key={idx}
                            section={section}
                            index={idx}
                            topicGradient={topicGradient}
                            totalSections={guideData.studyGuide.length}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div className="pt-12 pb-8 text-center">
                    <div className="inline-flex flex-col items-center gap-4 p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${topicGradient}`}>
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-slate-600 font-bold mb-1">
                                Has completado la guía
                            </p>
                            <p className="text-sm text-slate-500 font-medium max-w-md">
                                Revisa las secciones las veces que necesites para dominar el contenido
                            </p>
                        </div>
                        <button 
                            onClick={scrollToTop}
                            className={`group px-6 py-3 bg-gradient-to-r ${topicGradient} text-white rounded-2xl shadow-lg hover:shadow-xl font-bold transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                            <ArrowUp className="w-5 h-5 relative z-10" />
                            <span className="relative z-10">Volver al inicio</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudyGuide;