// src/pages/Content/Exam.tsx
import AnimatedPage from '../../components/layout/AnimatedPage';
/* eslint-disable react-hooks/error-boundaries */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronLeft, ChevronRight, Clock, Eye, EyeOff, ClipboardList,
    Trophy, CheckCircle2, ArrowLeft, Sparkles, RotateCcw,
    GraduationCap, Lightbulb, Zap, Target, Hash, BookOpen, BarChart3
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { canUserAccessSubject } from '../../utils/subjectAccessUtils';


import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

// ─────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────

const cleanMath = (math: any) => {
    if (typeof math !== 'string') return '';
    let cleaned = math.trim();
    if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) return cleaned.slice(2, -2).trim();
    if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) return cleaned.slice(2, -2).trim();
    if (cleaned.startsWith('$') && cleaned.endsWith('$')) return cleaned.slice(1, -1).trim();
    return cleaned;
};

const SafeInlineMath = ({ math }: any) => {
    try { return <InlineMath math={math} />; }
    catch { return <span className="text-amber-600 font-mono text-sm">{math}</span>; }
};

const SafeBlockMath = ({ math }: any) => {
    try { return <BlockMath math={math} />; }
    catch { return <div className="my-2 text-center"><code className="text-amber-600 font-mono text-sm">{math}</code></div>; }
};

const sanitizeLatex = (math: any) => {
    if (typeof math !== 'string') return math;
    return math
        .replace(/\\textdegree/g, '^{\\circ}')
        .replace(/\\degree/g, '^{\\circ}')
        .replace(/\\euro/g, '\\text{€}')
        .replace(/\\textregistered/g, '^{\\circledR}')
        .replace(/\\texttrademark/g, '^{\\text{TM}}')
        .replace(/N\\\\textdegree/g, 'N^{\\circ}');
};

const SmartText = ({ text }: any) => {
    if (!text) return null;
    let processed = text.replace(/\\n/g, '\n');
    processed = processed.replace(/\\euro/g, '€');
    processed = processed.replace(/\\textdegree/g, '°');
    processed = processed.replace(/\\degree/g, '°');

    const regex = /(\$[^$]+\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\*\*[^*]+\*\*|`[^`]+`|[A-Za-z]+(?:[_^](?:\{[^}]+\}|[A-Za-z0-9]))+|\\(?:[a-zA-Z]{2,}|[%&#$])(?:\{[^}]*\})*)/g;
    const parts = processed.split(regex);

    return (
        <>
            {parts.map((part, i: any) => {
                if (!part) return null;
                const isDelimitedMath = (part.startsWith('$') && part.endsWith('$')) ||
                    (part.startsWith('\\(') && part.endsWith('\\)')) ||
                    (part.startsWith('\\[') && part.endsWith('\\]'));
                if (isDelimitedMath) {
                    const content = sanitizeLatex(cleanMath(part));
                    const isBlock = content.length > 40 || content.includes('\\frac') || content.includes('\\sum') || content.includes('\\begin');
                    return isBlock ? (
                        <div key={i} className="my-4 overflow-x-auto custom-scrollbar pb-2 text-center">
                            <SafeBlockMath math={content} />
                        </div>
                    ) : <SafeInlineMath key={i} math={content} />;
                }
                if (/^\\(?:[a-zA-Z]{2,}|[%&#$])/.test(part)) return <SafeInlineMath key={i} math={sanitizeLatex(part)} />;
                if (/^[A-Za-z]+[_^]/.test(part)) return <SafeInlineMath key={i} math={sanitizeLatex(part)} />;
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-black text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <span key={i} className="inline-block mx-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">{part.slice(1, -1)}</span>;
                }
                return part.split('\n').map((line, li: any) => (
                    <React.Fragment key={`${i}-${li}`}>
                        {li > 0 && <br />}
                        {line}
                    </React.Fragment>
                ));
            })}
        </>
    );
};

const formatTime = (seconds: any) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// ─────────────────────────────────────────
// CIRCULAR TIMER
// ─────────────────────────────────────────

const CircularTimer = ({ timeLeft, total = 3600, gradient }: any) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / total;
    const offset = circumference * (1 - progress);
    const isLow = timeLeft < 300;
    const isUp = timeLeft <= 0;

    return (
        <div className="flex items-center gap-2.5">
            <div className="relative w-11 h-11">
                <svg className="w-11 h-11 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="3"
                        className="stroke-slate-200/60 dark:stroke-slate-700/60" />
                    <circle cx="24" cy="24" r={radius} fill="none" strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`transition-all duration-1000 ease-linear ${isUp ? 'stroke-red-500' : isLow ? 'stroke-red-400' : 'stroke-indigo-500 dark:stroke-indigo-400'}`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className={`w-3.5 h-3.5 ${isUp ? 'text-red-500' : isLow ? 'text-red-400 animate-pulse' : 'text-indigo-500 dark:text-indigo-400'}`} />
                </div>
            </div>
            <div className="flex flex-col">
                <span className={`font-mono font-black text-base tracking-tight leading-none ${
                    isUp ? 'text-red-500' : isLow ? 'text-red-400' : 'text-slate-800 dark:text-slate-200'
                }`}>
                    {isUp ? '00:00' : formatTime(timeLeft)}
                </span>
                <span className={`text-[10px] font-bold leading-none mt-0.5 ${
                    isUp ? 'text-red-400' : isLow ? 'text-red-300' : 'text-slate-400 dark:text-slate-500'
                }`}>
                    {isUp ? 'Finalizado' : isLow ? 'Poco tiempo' : 'Restante'}
                </span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// QUESTION NAV DOT
// ─────────────────────────────────────────

const QuestionDot = ({ index, isCurrent, isRevealed, gradient, onClick }: any) => (
    <button
        onClick={onClick}
        className={`group relative transition-all duration-500 ease-out ${isCurrent ? 'scale-110 z-10' : 'hover:scale-105'}`}
    >
        {/* Glow behind current dot */}
        {isCurrent && (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-lg opacity-50`} />
        )}
        <div className={`relative w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center transition-all duration-300 ${
            isCurrent
                ? `bg-gradient-to-br ${gradient} text-white shadow-2xl ring-4 ring-white/60 dark:ring-slate-800/60`
                : isRevealed
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/20 ring-2 ring-white/40 dark:ring-slate-800/40'
                    : 'bg-white dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-2 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-500 hover:shadow-md'
        }`}>
            {isRevealed && !isCurrent ? (
                <CheckCircle2 className="w-4 h-4" />
            ) : (
                index + 1
            )}
        </div>
        {isCurrent && (
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient} shadow-lg`} />
        )}
    </button>
);

// ─────────────────────────────────────────
// PREMIUM LOADING SPINNER
// ─────────────────────────────────────────

const ExamLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="relative z-10">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-40 animate-pulse" />
                <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-white/80 dark:border-slate-700/50">
                    <ClipboardList className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-pulse mb-2" />
                </div>
            </div>
            <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full shadow-xl border-2 border-white/50 dark:border-slate-700/50">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '100ms' }} />
                        <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '200ms' }} />
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-lg font-bold">Preparando tu examen</p>
                </div>
            </div>
        </div>
    </div>
);

const ExamFallbackState = ({
    title,
    description,
    buttonLabel = 'Volver',
    onBack,
    gradient,
    subjectWarning = '',
}) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 gap-6 p-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        <div className="relative z-10 max-w-md text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-600 rounded-3xl blur-2xl opacity-20" />
                <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border-2 border-white/80 dark:border-slate-700/50">
                    <ClipboardList className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
                </div>
            </div>
            <p className="text-slate-800 dark:text-slate-200 font-black text-2xl mb-2">{title}</p>
            <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mb-4">{description}</p>
            {subjectWarning && (
                <div className="mb-6 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-left text-xs font-semibold text-amber-700 dark:border-amber-800/70 dark:bg-amber-900/30 dark:text-amber-300">
                    {subjectWarning}
                </div>
            )}
            <button onClick={onBack}
                className={`group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r ${gradient} text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                <ArrowLeft className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{buttonLabel}</span>
            </button>
        </div>
    </div>
);

// ─────────────────────────────────────────
// COMPLETION SCREEN
// ─────────────────────────────────────────

const CompletionScreen = ({ examData, revealedAnswers, timeLeft, total, gradient, onRestart, onBack }: any) => {
    const answeredCount = Object.keys(revealedAnswers).filter(k => revealedAnswers[k]).length;
    const timeUsed = 3600 - timeLeft;
    const percentage = Math.round((answeredCount / total) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] blur-3xl animate-float`} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-[0.06] blur-3xl animate-float-delayed" />
            </div>

            <div className="relative max-w-lg w-full group/completion">
                {/* Card glow */}
                <div className={`absolute -inset-4 bg-gradient-to-br ${gradient} rounded-[3.5rem] blur-3xl opacity-20 group-hover/completion:opacity-30 transition-opacity duration-700`} />

                <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border-2 border-white/80 dark:border-slate-700/80 overflow-hidden group-hover/completion:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.3)] transition-all duration-700">
                    {/* Gradient top bar with shimmer */}
                    <div className="relative h-2 overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-r ${gradient}`} />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>

                    {/* Corner decorations */}
                    <div className={`absolute top-0 right-0 w-[20rem] h-[20rem] bg-gradient-to-br ${gradient} rounded-full blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2`} />
                    <div className={`absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr ${gradient} rounded-full blur-3xl opacity-5 translate-y-1/2 -translate-x-1/2`} />

                    <div className="relative p-10 text-center">
                        {/* Trophy icon with glow */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative group/icon">
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-[2rem] blur-2xl opacity-50 group-hover/icon:opacity-70 transition-opacity duration-500`} />
                                <div className={`relative w-24 h-24 rounded-[2rem] bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-2xl ring-8 ring-white dark:ring-slate-800 transform group-hover/icon:scale-110 group-hover/icon:rotate-6 transition-all duration-500`}>
                                    <Trophy className="w-12 h-12" />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                            Examen completado
                        </h2>
                        <p className={`font-bold mb-8 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                            {examData.title}
                        </p>

                        {/* Stats grid */}
                        <div className="grid grid-cols-3 gap-4 mb-10">
                            <div className="bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/50 rounded-2xl p-4 border-2 border-white/80 dark:border-slate-700/60 shadow-lg">
                                <div className={`text-2xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                                    {answeredCount}/{total}
                                </div>
                                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Revisadas</div>
                            </div>
                            <div className="bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/50 rounded-2xl p-4 border-2 border-white/80 dark:border-slate-700/60 shadow-lg">
                                <div className="text-2xl font-black text-emerald-500">{percentage}%</div>
                                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Avance</div>
                            </div>
                            <div className="bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/50 rounded-2xl p-4 border-2 border-white/80 dark:border-slate-700/60 shadow-lg">
                                <div className="text-2xl font-black text-slate-800 dark:text-slate-200">{formatTime(timeUsed)}</div>
                                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Tiempo</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button onClick={onRestart}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-lg transition-all duration-300">
                                <RotateCcw className="w-4 h-4" />
                                Repetir
                            </button>
                            <button onClick={onBack}
                                className={`group/btn flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r ${gradient} text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700" />
                                <ArrowLeft className="w-4 h-4 relative z-10" />
                                <span className="relative z-10">Volver al tema</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────

const Exam = ({ user }) => {
    const { subjectId, topicId, examId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const questionRef = useRef<any>(null);

    const [loading, setLoading] = useState(true);
    const [examData, setExamData] = useState<any>(null);
    const [examLoadError, setExamLoadError] = useState('');
    const [subjectLoadWarning, setSubjectLoadWarning] = useState('');
    const [examNotFound, setExamNotFound] = useState(false);
    const [topicGradient, setTopicGradient] = useState('from-indigo-500 to-purple-600');
    const [currentQ, setCurrentQ] = useState(0);
    const [revealedAnswers, setRevealedAnswers] = useState<any>({});
    const [timeLeft, setTimeLeft] = useState(3600);
    const [timerActive, setTimerActive] = useState(true);
    const [showCompletion, setShowCompletion] = useState(false);
    const [_slideDir, setSlideDir] = useState('right');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMouseAtTop, setIsMouseAtTop] = useState(true);
    const [previewAsStudent, setPreviewAsStudent] = useState(
        () => sessionStorage.getItem('dlpPreviewAsStudent') === '1'
    );

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;

        const previousHeaderOffset = document.body.style.getPropertyValue('--app-fixed-header-height');

        document.body.classList.add('has-fixed-header');
        document.body.style.setProperty('--app-fixed-header-height', '6rem');

        return () => {
            document.body.classList.remove('has-fixed-header');

            if (previousHeaderOffset) {
                document.body.style.setProperty('--app-fixed-header-height', previousHeaderOffset);
            } else {
                document.body.style.removeProperty('--app-fixed-header-height');
            }
        };
    }, []);

    // Load data
    useEffect(() => {
        const load = async () => {
            if (!examId) {
                setExamLoadError('No se pudo identificar el examen.');
                setExamData(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setExamLoadError('');
                setExamNotFound(false);
                setSubjectLoadWarning('');
                setExamData(null);

                // Preview mode: use prefetched exam data instead of Firestore
                const prefetchedExam = (location?.state as any)?.prefetchedExam;
                const stateSubjectColor = (location?.state as any)?.subjectColor;
                if (prefetchedExam) {
                    const questions = prefetchedExam.questions || [];
                    setExamData({ ...prefetchedExam, questions });
                    if (stateSubjectColor) {
                        setTopicGradient(stateSubjectColor);
                    }
                    setLoading(false);
                    return;
                }

                try {
                    if (subjectId) {
                        const subSnap = await getDoc(doc(db, 'subjects', subjectId));
                        if (subSnap.exists()) {
                            const subjectData = subSnap.data();
    
                            if (user?.uid) {
                                const hasSubjectAccess = await canUserAccessSubject({
                                    subject: { id: subSnap.id, ...subjectData },
                                    user
                                });
    
                                if (!hasSubjectAccess) {
                                    navigate('/home');
                                    return;
                                }
                            }
    
                            if (subjectData?.color) {
                                setTopicGradient(subjectData.color);
                            }
                        }
                    }
                } catch (subjectError) {
                    console.error('Error loading subject context for exam:', subjectError);
                    setSubjectLoadWarning(
                        'No se pudo cargar el contexto de la asignatura. El examen se mostrara con el tema por defecto.'
                    );
                }

                const examSnap = await getDoc(doc(db, 'exams', examId));
                if (!examSnap.exists()) {
                    setExamNotFound(true);
                    return;
                }

                const data = examSnap.data();
                // Questions should already be in order from migration, but sort just in case
                const questions = (data.questions || []);
                setExamData({ ...data, questions });
            } catch (err: any) {
                console.error('Error loading exam:', err);
                if (err?.code === 'permission-denied') {
                    setExamLoadError('No tienes permiso para ver este examen.');
                } else {
                    setExamLoadError('No se pudo cargar el examen. Intentalo de nuevo.');
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [subjectId, examId, navigate, user, location?.state]);


    // Timer
    useEffect(() => {
        if (!timerActive || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { setTimerActive(false); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    // Scroll detection for header auto-hide
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 80);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mouse-at-top detection
    useEffect(() => {
        const handleMouseMove = (e: any) => {
            setIsMouseAtTop(e.clientY < 200);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const toggleAnswer = useCallback((idx: any) => {
        setRevealedAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
    }, []);

    const navigateQuestion = useCallback((targetIdx: any) => {
        if (targetIdx === currentQ || isTransitioning) return;
        setSlideDir(targetIdx > currentQ ? 'right' : 'left');
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentQ(targetIdx);
            setIsTransitioning(false);
            if (questionRef.current) {
                questionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 200);
    }, [currentQ, isTransitioning]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: any) => {
            if (!examData) return;
            const total = examData.questions.length;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                navigateQuestion(Math.min(total - 1, currentQ + 1));
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                navigateQuestion(Math.max(0, currentQ - 1));
            }
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                toggleAnswer(currentQ);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [currentQ, examData, navigateQuestion, toggleAnswer]);

    const goBack = () => navigate(`/home/subject/${subjectId}/topic/${topicId}`);

    const handleRestart = () => {
        setCurrentQ(0);
        setRevealedAnswers({});
        setTimeLeft(3600);
        setTimerActive(true);
        setShowCompletion(false);
    };

    const handleDisablePreview = () => {
        sessionStorage.removeItem('dlpPreviewAsStudent');
        setPreviewAsStudent(false);
    };

    const answeredCount = useMemo(() =>
        Object.keys(revealedAnswers).filter(k => revealedAnswers[k]).length,
        [revealedAnswers]
    );

    // Loading
    if (loading) return <ExamLoading />;

    if (examLoadError) {
        return (
            <ExamFallbackState
                title="No se pudo abrir el examen"
                description={examLoadError}
                buttonLabel="Volver"
                onBack={goBack}
                gradient={topicGradient}
                subjectWarning={subjectLoadWarning}
            />
        );
    }

    if (examNotFound) {
        return (
            <ExamFallbackState
                title="Examen no encontrado"
                description="Este examen no existe o ya no esta disponible."
                buttonLabel="Volver"
                onBack={goBack}
                gradient={topicGradient}
                subjectWarning={subjectLoadWarning}
            />
        );
    }

    // No data
    if (!examData || !examData.questions?.length) {
        return (
            <ExamFallbackState
                title="Sin preguntas"
                description="Este examen no tiene preguntas disponibles."
                buttonLabel="Volver"
                onBack={goBack}
                gradient={topicGradient}
                subjectWarning={subjectLoadWarning}
            />
        );
    }

    // Completion
    if (showCompletion) {
        return (
            <CompletionScreen
                examData={examData}
                revealedAnswers={revealedAnswers}
                timeLeft={timeLeft}
                total={examData.questions.length}
                gradient={topicGradient}
                onRestart={handleRestart}
                onBack={goBack}
            />
        );
    }

    const total = examData.questions.length;
    const question = examData.questions[currentQ];
    const isRevealed = revealedAnswers[currentQ];
    const isTimeUp = timeLeft <= 0;
    const isLowTime = timeLeft < 300;
    const isLastQuestion = currentQ === total - 1;
    const progressPercent = ((currentQ + 1) / total) * 100;
    const headerVisible = !isScrolled || isMouseAtTop;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 selection:bg-indigo-200 dark:selection:bg-indigo-800 relative overflow-hidden">

            {previewAsStudent && (
                <div className="fixed top-3 right-3 z-[70] rounded-xl border border-amber-200 bg-amber-50/95 px-3 py-2 shadow-lg backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-amber-700">
                        <GraduationCap className="w-3.5 h-3.5" />
                        Vista alumno temporal
                        <button
                            onClick={handleDisablePreview}
                            className="ml-2 rounded-md bg-amber-500 px-2 py-1 text-[10px] uppercase tracking-wider text-white hover:bg-amber-600 transition-colors"
                        >
                            Salir
                        </button>
                    </div>
                </div>
            )}

            {subjectLoadWarning && (
                <div className="fixed top-14 left-1/2 z-[65] w-[min(92vw,640px)] -translate-x-1/2 rounded-2xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 text-xs font-bold text-amber-700 shadow-lg backdrop-blur-sm dark:border-amber-800/70 dark:bg-amber-900/45 dark:text-amber-200">
                    {subjectLoadWarning}
                </div>
            )}

            {/* Animated background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-br ${topicGradient} opacity-[0.04] blur-3xl animate-float`} />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 opacity-[0.03] blur-3xl animate-float-delayed" />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br ${topicGradient} opacity-[0.02] blur-3xl`} />
            </div>

            {/* Timer progress bar — top edge with shimmer */}
            <div className="fixed top-0 left-0 right-0 h-1.5 z-50 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="relative h-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ease-linear relative ${
                        isTimeUp ? 'bg-red-500' : isLowTime ? 'bg-red-400' : `bg-gradient-to-r ${topicGradient}`
                    }`} style={{ width: `${(timeLeft / 3600) * 100}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 blur-sm" />
                    </div>
                </div>
            </div>

            {/* ─── STICKY HEADER with auto-hide ─── */}
            <div className={`fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-b-2 border-white/50 dark:bg-slate-950/80 dark:border-slate-700/50 shadow-2xl transition-all duration-500 ${
                headerVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}>
                <div className={`max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-500 ${
                    isScrolled ? 'h-14' : 'h-16'
                }`}>
                    {/* Left: Back + Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button onClick={goBack}
                            className="group p-2 -ml-2 hover:bg-white/80 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:-translate-x-0.5 transition-transform duration-300" />
                        </button>
                        <div className="relative shrink-0">
                            <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-xl blur-md opacity-50`} />
                            <div className={`relative w-8 h-8 rounded-xl bg-gradient-to-br ${topicGradient} flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-slate-800`}>
                                <ClipboardList className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h1 className="font-black text-slate-900 dark:text-white text-sm md:text-base truncate">
                                {examData.title || 'Examen'}
                            </h1>
                            {!isScrolled && (
                                <div className="flex items-center gap-1.5 animate-in fade-in duration-300">
                                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${topicGradient}`} />
                                    <span className={`text-[10px] font-bold bg-gradient-to-r ${topicGradient} bg-clip-text text-transparent`}>
                                        Pregunta {currentQ + 1} de {total}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Stats + Timer */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
                            <Eye className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                {answeredCount}/{total}
                            </span>
                        </div>
                        <CircularTimer timeLeft={timeLeft} gradient={topicGradient} />
                    </div>
                </div>
            </div>

            {/* ─── MAIN CONTENT ─── */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">

                {/* Question progress bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Progreso</span>
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400">{currentQ + 1} de {total}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200/60 dark:bg-slate-800/60 overflow-hidden shadow-inner">
                        <div className="relative h-full overflow-hidden">
                            <div
                                className={`h-full rounded-full bg-gradient-to-r ${topicGradient} transition-all duration-500 ease-out relative`}
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question navigation dots */}
                <div className="flex justify-center gap-1.5 sm:gap-2 mb-8 flex-wrap">
                    {examData.questions.map((_, idx: any) => (
                        <QuestionDot
                            key={idx}
                            index={idx}
                            isCurrent={idx === currentQ}
                            isRevealed={!!revealedAnswers[idx]}
                            gradient={topicGradient}
                            onClick={() => navigateQuestion(idx)}
                        />
                    ))}
                </div>

                {/* ─── QUESTION CARD ─── */}
                <div ref={questionRef} className="relative mb-8 group/card scroll-mt-24">
                    {/* Card glow */}
                    <div className={`absolute -inset-4 bg-gradient-to-br ${topicGradient} rounded-[3.5rem] blur-3xl opacity-[0.08] group-hover/card:opacity-[0.15] transition-opacity duration-700`} />

                    <div className={`relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border-2 border-white/80 dark:shadow-slate-900/50 dark:bg-slate-900/95 dark:border-slate-700/80 overflow-hidden transition-all duration-300 group-hover/card:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.25)] ${
                        isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                    }`}>
                        {/* Gradient accent with shimmer */}
                        <div className="relative h-2 overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-r ${topicGradient}`} />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        </div>

                        {/* Corner decorations */}
                        <div className={`absolute top-0 right-0 w-[32rem] h-[32rem] bg-gradient-to-br ${topicGradient} rounded-full blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2`} />
                        <div className={`absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr ${topicGradient} rounded-full blur-3xl opacity-5 translate-y-1/2 -translate-x-1/2`} />

                        <div className="relative p-6 sm:p-8 md:p-10 lg:p-12">
                            {/* Question header */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="relative shrink-0">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${topicGradient} rounded-2xl blur-lg opacity-50`} />
                                    <div className={`relative w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${topicGradient} flex items-center justify-center text-white font-black text-lg shadow-2xl ring-4 ring-white dark:ring-slate-800`}>
                                        {currentQ + 1}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                                        Pregunta {currentQ + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${topicGradient}`} />
                                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                            de {total} preguntas
                                        </span>
                                    </div>
                                </div>
                                {isRevealed && (
                                    <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Revisada</span>
                                    </div>
                                )}
                            </div>

                            {/* Enunciado */}
                            <div className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium mb-8">
                                <SmartText text={question.question} />
                            </div>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className={`w-full h-px bg-gradient-to-r from-transparent via-slate-300/60 dark:via-slate-600/60 to-transparent`} />
                                </div>
                                <div className="relative flex justify-center">
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${topicGradient} ring-4 ring-white dark:ring-slate-900`} />
                                </div>
                            </div>

                            {/* Toggle answer */}
                            <button
                                onClick={() => toggleAnswer(currentQ)}
                                className={`group/reveal flex items-center gap-3 px-7 py-4 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-[0.97] relative overflow-hidden ${
                                    isRevealed
                                        ? 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-2 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-lg'
                                        : `bg-gradient-to-r ${topicGradient} text-white shadow-xl hover:shadow-2xl hover:scale-[1.02]`
                                }`}
                            >
                                {!isRevealed && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover/reveal:translate-x-0 transition-transform duration-700" />
                                )}
                                {isRevealed ? (
                                    <>
                                        <EyeOff className="w-4 h-4 relative z-10" />
                                        <span className="relative z-10">Ocultar respuesta</span>
                                    </>
                                ) : (
                                    <>
                                        <Lightbulb className="w-4 h-4 group-hover/reveal:rotate-12 transition-transform relative z-10" />
                                        <span className="relative z-10">Ver respuesta</span>
                                    </>
                                )}
                            </button>

                            {/* ─── ANSWER SECTION ─── */}
                            {isRevealed && question.detailedAnswer && (
                                <div className="mt-8 space-y-5 animate-in slide-in-from-top-4 duration-500 fade-in">
                                    {/* Procedimiento */}
                                    {question.detailedAnswer.procedure && (
                                        <div className="group/proc relative overflow-hidden">
                                            <div className={`absolute -inset-2 bg-gradient-to-br ${topicGradient} rounded-[2rem] blur-2xl opacity-0 group-hover/proc:opacity-10 transition-opacity duration-700`} />
                                            <div className="relative rounded-2xl overflow-hidden border-2 border-white/80 dark:border-slate-700/60 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50 shadow-xl group-hover/proc:shadow-2xl transition-all duration-500">
                                                <div className={`relative px-5 py-3.5 bg-gradient-to-r ${topicGradient} flex items-center gap-2 overflow-hidden`}>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                                    <Zap className="w-4 h-4 text-white/90 relative z-10" />
                                                    <span className="font-black text-sm text-white tracking-wide relative z-10 uppercase">Procedimiento</span>
                                                </div>
                                                <div className="p-5 sm:p-6 text-slate-700 dark:text-slate-300 leading-relaxed">
                                                    <SmartText text={question.detailedAnswer.procedure} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resultado */}
                                    {question.detailedAnswer.result && (
                                        <div className="group/result relative overflow-hidden">
                                            <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] blur-2xl opacity-0 group-hover/result:opacity-10 transition-opacity duration-700" />
                                            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-900/50 shadow-xl group-hover/result:shadow-2xl transition-all duration-500">
                                                <div className="relative px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center gap-2 overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                                    <Target className="w-4 h-4 text-white/90 relative z-10" />
                                                    <span className="font-black text-sm text-white tracking-wide relative z-10 uppercase">Resultado</span>
                                                </div>
                                                <div className="p-5 sm:p-6 text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                                                    <SmartText text={question.detailedAnswer.result} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── NAVIGATION ─── */}
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigateQuestion(Math.max(0, currentQ - 1))}
                        disabled={currentQ === 0}
                        className={`flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 active:scale-[0.97] ${
                            currentQ === 0
                                ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50 text-slate-400'
                                : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl border-2 border-white/80 dark:border-slate-700/60 hover:scale-[1.02]'
                        }`}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Anterior</span>
                    </button>

                    {/* Keyboard hint */}
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-300 dark:text-slate-600">
                        <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 shadow-sm">←→</kbd>
                        navegar
                        <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 shadow-sm">espacio</kbd>
                        respuesta
                    </div>

                    {isLastQuestion ? (
                        <button
                            onClick={() => setShowCompletion(true)}
                            className="group/finish flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.97] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover/finish:translate-x-0 transition-transform duration-700" />
                            <Trophy className="w-4 h-4 relative z-10" />
                            <span className="hidden sm:inline relative z-10">Finalizar</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => navigateQuestion(Math.min(total - 1, currentQ + 1))}
                            className={`group/next flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r ${topicGradient} text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.97] relative overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover/next:translate-x-0 transition-transform duration-700" />
                            <span className="hidden sm:inline relative z-10">Siguiente</span>
                            <ChevronRight className="w-4 h-4 relative z-10" />
                        </button>
                    )}
                </div>

                {/* Bottom stats (mobile-visible) */}
                <div className="flex justify-center gap-3 mt-8 sm:hidden">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-white/80 dark:border-slate-700/50 shadow-lg">
                        <Hash className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{currentQ + 1}/{total}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-white/80 dark:border-slate-700/50 shadow-lg">
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{answeredCount} vistas</span>
                    </div>
                </div>
            </main>

            <style>{`
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
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #6366f1, #8b5cf6); border-radius: 10px; }
                .dark .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .katex { color: #1e293b; font-size: 1.05em; }
                .dark .katex { color: #e2e8f0; }
                .katex-display { margin: 0.75em 0; }
            `}</style>
        </div>
    );
};

export default Exam;
