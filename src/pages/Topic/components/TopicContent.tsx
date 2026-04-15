// src/pages/Topic/components/TopicContent.jsx
import React, { useMemo, useState } from 'react';
import {
    Loader2,
    FileText,
    Upload,
    BookOpen,
    Calculator,
    FlaskConical,
    BookMarked,
    GraduationCap,
    ClipboardCheck,
    Timer,
    Play,
    RotateCcw,
    Clock,
    Eye,
    Download,
    MoreVertical,
    Pencil,
    CalendarDays,
    Lock,
    AlertTriangle,
    XCircle
} from 'lucide-react';
import FileCard from '../FileCard/FileCard';
import ExamCard from '../ExamCard/ExamCard';
import TopicAssignmentsSection from './TopicAssignmentsSection';
import QuizClassResultsModal from './QuizClassResultsModal';
import { getActiveRole } from '../../../utils/permissionUtils';

const TopicContent = ({ 
    activeTab, 
    topic, 
    subject,
    uploading, 
    fileInputRef, 
    handleManualUpload,
    activeMenuId, setActiveMenuId, renamingId, setRenamingId, tempName, setTempName,
    handleMenuClick, startRenaming, saveRename, deleteFile, handleViewFile, getFileVisuals,
    handleChangeFileCategory,
    deleteQuiz, navigate, subjectId, topicId, user,
    quizAnalyticsByQuiz = {},
    onSaveQuizScoreOverride,
    failedQuestions = [],
    permissions // *** NEW: Permission flags ***
}: any) => {
    const [selectedQuizForClassAnalytics, setSelectedQuizForClassAnalytics] = useState<any>(null);
    const [quizExportMessage, setQuizExportMessage] = useState('');
    const activeRole = getActiveRole(user);
    const isStudentRole = activeRole === 'student' || permissions?.isViewer;
    
    // 👇 CALCULAR completionByLevel DIRECTO DE topic.quizzes (que ya tienen .score)
    const completionByLevel = useMemo(() => {
        if (!topic?.quizzes) {
            return {
                basico: { completed: 0, total: 0, averageScore: 0 },
                intermedio: { completed: 0, total: 0, averageScore: 0 },
                avanzado: { completed: 0, total: 0, averageScore: 0 }
            };
        }

        const levelOrder = { 
            'básico': 0, 'basico': 0, 'basic': 0, 'principiante': 0, 
            'intermedio': 1, 'medio': 1, 'advanced': 1, 
            'avanzado': 2, 'final': 2, 'experto': 2 
        };
        
        const stats: any = {
            basico: { completed: 0, total: 0, scores: [] },
            intermedio: { completed: 0, total: 0, scores: [] },
            avanzado: { completed: 0, total: 0, scores: [] }
        };
        
        topic.quizzes.forEach(quiz => {
            const level = (quiz.level || quiz.type || '').toLowerCase();
            const levelValue = levelOrder[level] !== undefined ? levelOrder[level] : 0;
            const levelKey = levelValue === 0 ? 'basico' : levelValue === 1 ? 'intermedio' : 'avanzado';
            
            stats[levelKey].total++;
            
            // 👇 USAR quiz.score que ya viene del enriquecimiento
            if (quiz.score !== undefined && quiz.score !== null) {
                stats[levelKey].completed++;
                stats[levelKey].scores.push(Number(quiz.score));
            }
        });

        // Calcular promedios
        return {
            basico: {
                completed: stats.basico.completed,
                total: stats.basico.total,
                averageScore: stats.basico.scores.length > 0 
                    ? Number(((stats.basico.scores.reduce((a, b) => a + b, 0) / stats.basico.scores.length) / 10).toFixed(1))
                    : 0
            },
            intermedio: {
                completed: stats.intermedio.completed,
                total: stats.intermedio.total,
                averageScore: stats.intermedio.scores.length > 0 
                    ? Number(((stats.intermedio.scores.reduce((a, b) => a + b, 0) / stats.intermedio.scores.length) / 10).toFixed(1))
                    : 0
            },
            avanzado: {
                completed: stats.avanzado.completed,
                total: stats.avanzado.total,
                averageScore: stats.avanzado.scores.length > 0 
                    ? Number(((stats.avanzado.scores.reduce((a, b) => a + b, 0) / stats.avanzado.scores.length) / 10).toFixed(1))
                    : 0
            }
        };
    }, [topic?.quizzes]); // 👈 Re-calcular cuando cambien los quizzes

    // --- MATERIALS TAB ---
    if (activeTab === 'materials') {
        const mainGuide = topic.pdfs?.find(f =>
            ['summary', 'resumen'].includes((f.type || '').toLowerCase())
        ) || topic.pdfs?.[0];

        let hasFormulas = false;
        if (mainGuide?.studyGuide) {
            try {
                const sections = typeof mainGuide.studyGuide === 'string'
                    ? JSON.parse(mainGuide.studyGuide)
                    : mainGuide.studyGuide;
                hasFormulas = Array.isArray(sections) && sections.some(s => s.formulas?.length > 0);
            } catch { hasFormulas = false; }
        }

        const subjectColor = subject?.color || 'from-indigo-500 to-purple-600';

        const aiExamFiles = (topic.pdfs || []).filter((file: any) => {
            const type = (file?.type || '').toLowerCase();
            return type.includes('exam') || type.includes('evaluación') || type.includes('evaluation');
        });
        const generatedExams = topic.exams || [];
        const hasExams = aiExamFiles.length > 0 || generatedExams.length > 0;

        return (
            <div className="space-y-10">
                {mainGuide && (
                    <div className="flex gap-6 items-stretch">
                    {/* LEFT: Guía Completa */}
                    <button
                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${mainGuide.id}`, {
                            state: { prefetchedGuide: mainGuide }
                        })}
                        className="flex-1 group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 hover:scale-[1.01] text-left"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 group-hover:opacity-100 transition-opacity`} />
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <BookOpen className="w-40 h-40 text-white absolute -bottom-8 -right-8 opacity-10 rotate-12" strokeWidth={1.2} />
                        </div>
                        <div className="relative z-10 p-8 flex flex-col justify-between h-full min-h-[12rem]">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                                    Guía Completa
                                </h3>
                                <p className="text-white/80 text-sm font-medium line-clamp-2">
                                    {mainGuide.title || mainGuide.name || 'Guía de estudio'}
                                </p>
                            </div>
                            <span className="text-white/60 text-xs font-bold mt-4 group-hover:text-white/90 transition-colors">
                                Ver guía →
                            </span>
                        </div>
                    </button>

                    {/* RIGHT: Calculadora (solo si hay fórmulas) */}
                    {hasFormulas && (
                        <button
                            onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/formulas/${mainGuide.id}`)}
                            className="group relative w-40 shrink-0 overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 hover:scale-[1.03]"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 group-hover:opacity-100 transition-opacity`} />
                            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 p-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Calculator className="w-8 h-8 text-white" strokeWidth={1.5} />
                                </div>
                                <span className="text-white font-bold text-sm text-center">Fórmulas</span>
                            </div>
                        </button>
                    )}
                </div>
                )}

                {/* EXÁMENES SECTION */}
                {hasExams && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 tracking-tight">Exámenes</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Evaluaciones completas para cada nivel</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {aiExamFiles.map((file, idx: any) => {
                                const subjectGradient = `bg-gradient-to-br ${subjectColor}`;
                                return (
                                    <div
                                        key={file.id || `ai-exam-materials-${idx}`}
                                        onClick={() => {
                                            if (file.url) {
                                                handleViewFile(file);
                                            }
                                        }}
                                        className="group cursor-pointer relative overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 hover:scale-[1.01]"
                                    >
                                        <div className={`absolute inset-0 ${subjectGradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            <FileText className="w-28 h-28 text-white absolute -bottom-5 -right-5 rotate-12 opacity-[0.12]" strokeWidth={1.2} />
                                        </div>
                                        <div className="relative z-10 p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-white/70 mb-1">Generado por IA</p>
                                                    <h4 className="text-sm font-semibold text-white line-clamp-1">
                                                        {file.title || file.name || 'Examen generado'}
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-white/80 mb-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 border border-white/25 font-semibold">
                                                    <FileText className="w-3 h-3" strokeWidth={1.5} />
                                                    PDF IA
                                                </span>
                                            </div>
                                            <button className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-white/20 border border-white/30 backdrop-blur-sm transition-all hover:bg-white/25 active:scale-95">
                                                Ver examen
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {generatedExams.map(exam => {
                                const subjectGradient = `bg-gradient-to-br ${subjectColor}`;
                                return (
                                    <div
                                        key={exam.id}
                                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}`, user?.__previewMockData === true ? { state: { prefetchedExam: exam } } : undefined)}
                                        className="group cursor-pointer relative overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 hover:scale-[1.01]"
                                    >
                                        <div className={`absolute inset-0 ${subjectGradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            <FileText className="w-28 h-28 text-white absolute -bottom-5 -right-5 rotate-12 opacity-[0.12]" strokeWidth={1.2} />
                                        </div>
                                        <div className="relative z-10 p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-white/70 mb-1">Evaluación del tema</p>
                                                    <h4 className="text-sm font-semibold text-white line-clamp-1">
                                                        {exam.title || 'Examen'}
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-white/80 mb-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 border border-white/25 font-semibold">
                                                    <FileText className="w-3 h-3" strokeWidth={1.5} />
                                                    {exam.questions?.length || 0} preguntas
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 border border-white/25 font-semibold">
                                                    <Timer className="w-3 h-3" strokeWidth={1.5} />
                                                    1h
                                                </span>
                                            </div>
                                            <button className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-white/20 border border-white/30 backdrop-blur-sm transition-all hover:bg-white/25 active:scale-95">
                                                Comenzar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- MATERIALES TAB (Students Only) ---
    if (activeTab === 'materiales') {
        const subjectColor = subject?.color || 'from-indigo-500 to-purple-600';
        const allAiFiles = topic.pdfs || [];
        const aiSummaryCandidates = allAiFiles.filter(f => ['summary', 'resumen'].includes((f.type || '').toLowerCase()));
        const isStudyGuideRecord = (file) => Boolean(file?.studyGuide) || file?._collection === 'resumen';
        // Only use records compatible with StudyGuide page routing.
        const mainGuide = aiSummaryCandidates.find(isStudyGuideRecord)
            || allAiFiles.find(isStudyGuideRecord)
            || aiSummaryCandidates[0]
            || allAiFiles[0]
            || null;
        const aiExamFiles = allAiFiles.filter((f: any) => {
            const type = (f?.type || '').toLowerCase();
            return type.includes('exam') || type.includes('evaluación') || type.includes('evaluation');
        });
        const extraAiSummaryFiles = allAiFiles.filter((f) => f.id !== mainGuide?.id && !aiExamFiles.some((examFile) => examFile.id === f.id));
        // Legacy uploads without category are treated as resúmenes to avoid hiding existing files.
        const uploadResumenFiles = topic.uploads?.filter((u: any) => {
            const category = (u?.fileCategory || '').toLowerCase();
            return !category || category === 'resumen' || category === 'material-teorico' || category === 'ejercicios';
        }) || [];
        const isSourcePdfUpload = (file) => file?.source === 'manual' && (file?.type || '').toLowerCase() === 'pdf';
        const orderedResumenCards = [...uploadResumenFiles, ...extraAiSummaryFiles]
            .sort((a, b) => Number(isSourcePdfUpload(b)) - Number(isSourcePdfUpload(a)));
        const sourcePdfCardIndex = orderedResumenCards.findIndex(isSourcePdfUpload);
        const sourcePdfCard = sourcePdfCardIndex >= 0 ? orderedResumenCards[sourcePdfCardIndex] : null;
        const resumenCards = sourcePdfCardIndex >= 0
            ? orderedResumenCards.filter((_, index) => index !== sourcePdfCardIndex)
            : orderedResumenCards;
        const totalResumenCardsCount = resumenCards.length + (sourcePdfCard ? 1 : 0);

        const uploadExamFiles = topic.uploads?.filter((u: any) => {
            const category = (u?.fileCategory || '').toLowerCase();
            return category === 'examen' || category === 'examenes';
        }) || [];
        const generatedExams = topic.exams || [];
        const hasAnyExam = uploadExamFiles.length > 0 || aiExamFiles.length > 0 || generatedExams.length > 0;

        let hasFormulas = false;
        if (mainGuide?.studyGuide) {
            try {
                const sections = typeof mainGuide.studyGuide === 'string'
                    ? JSON.parse(mainGuide.studyGuide)
                    : mainGuide.studyGuide;
                hasFormulas = Array.isArray(sections) && sections.some(s => s.formulas?.length > 0);
            } catch {
                hasFormulas = false;
            }
        }

        const guideSpanBySummaryCount = Math.max(1, 3 - Math.min(totalResumenCardsCount, 2));
        const guideSpanClass = guideSpanBySummaryCount === 3
            ? 'lg:col-span-3'
            : guideSpanBySummaryCount === 2
                ? 'lg:col-span-2'
                : 'lg:col-span-1';

        return (
            <div className="space-y-10">
                {/* RESÚMENES SECTION */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 tracking-tight">Resúmenes</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Apuntes y referencias de estudio</p>
                    </div>
                    {!mainGuide && totalResumenCardsCount === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50">
                            <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">Sin resúmenes</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
                                {sourcePdfCard && (
                                    <FileCard
                                        key={sourcePdfCard.id || 'source-pdf-first'}
                                        file={{
                                            ...sourcePdfCard,
                                            name: sourcePdfCard.name || sourcePdfCard.title || 'Documento base',
                                            type: sourcePdfCard.type || 'pdf',
                                            origin: sourcePdfCard.origin || 'manual'
                                        }}
                                        badgeLabel="Documento base"
                                        topic={topic}
                                        subject={subject}
                                        onView={() => {
                                            if (sourcePdfCard.url) {
                                                handleViewFile(sourcePdfCard);
                                            }
                                        }}
                                        activeMenuId={activeMenuId}
                                        setActiveMenuId={setActiveMenuId}
                                        renamingId={renamingId}
                                        setRenamingId={setRenamingId}
                                        tempName={tempName}
                                        setTempName={setTempName}
                                        handleMenuClick={handleMenuClick}
                                        saveRename={saveRename}
                                        deleteFile={deleteFile}
                                        permissions={permissions}
                                    />
                                )}

                                {mainGuide && (
                                    <button
                                        onClick={() => {
                                            if (isStudyGuideRecord(mainGuide)) {
                                                navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${mainGuide.id}`, {
                                                    state: { prefetchedGuide: mainGuide }
                                                });
                                                return;
                                            }
                                            if (mainGuide?.url) {
                                                handleViewFile(mainGuide);
                                            }
                                        }}
                                        className={`group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 hover:scale-[1.01] text-left md:col-span-2 ${guideSpanClass}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 group-hover:opacity-100 transition-opacity`} />
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            <BookOpen className="w-40 h-40 text-white absolute -bottom-8 -right-8 opacity-10 rotate-12" strokeWidth={1.2} />
                                        </div>
                                        <div className="relative z-10 p-8 flex flex-col justify-between h-full min-h-[16rem]">
                                            <div>
                                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                                    <BookOpen className="w-6 h-6 text-white" strokeWidth={1.5} />
                                                </div>
                                                <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                                                    Guía Completa
                                                </h3>
                                                <p className="text-white/80 text-sm font-medium line-clamp-2">
                                                    {mainGuide.title || mainGuide.name || 'Guía de estudio'}
                                                </p>
                                            </div>
                                            <span className="text-white/60 text-xs font-bold mt-4 group-hover:text-white/90 transition-colors">
                                                {isStudyGuideRecord(mainGuide) ? 'Ver guía →' : 'Ver archivo →'}
                                            </span>
                                        </div>
                                    </button>
                                )}

                                {mainGuide && (
                                    <button
                                        onClick={() => {
                                            if (!hasFormulas) return;
                                            navigate(`/home/subject/${subjectId}/topic/${topicId}/formulas/${mainGuide.id}`);
                                        }}
                                        className={`group relative overflow-hidden rounded-3xl shadow-sm min-h-[16rem] transition-all duration-500 ${hasFormulas ? 'hover:shadow-md hover:scale-[1.03]' : 'opacity-70 cursor-not-allowed'}`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 ${hasFormulas ? 'group-hover:opacity-100' : ''} transition-opacity`} />
                                        <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 p-6">
                                            <div className={`w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ${hasFormulas ? 'group-hover:scale-110 transition-transform duration-300' : ''}`}>
                                                <Calculator className="w-8 h-8 text-white" strokeWidth={1.5} />
                                            </div>
                                            <span className="text-white font-bold text-sm text-center">{hasFormulas ? 'Fórmulas' : 'Sin fórmulas'}</span>
                                        </div>
                                    </button>
                                )}

                                {resumenCards.map((file, idx: any) => (
                                    <FileCard
                                        key={file.id || `resumen-${idx}`}
                                        file={{
                                            ...file,
                                            name: file.name || file.title || 'Resumen',
                                            type: isStudyGuideRecord(file) ? 'summary' : (file.type || 'resumen'),
                                            origin: isStudyGuideRecord(file) ? 'AI' : file.origin
                                        }}
                                        topic={topic}
                                        subject={subject}
                                        onView={() => {
                                            if (isStudyGuideRecord(file)) {
                                                navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${file.id}`, {
                                                    state: { prefetchedGuide: file }
                                                });
                                                return;
                                            }
                                            if (file.url) {
                                                handleViewFile(file);
                                            }
                                        }}
                                        activeMenuId={activeMenuId}
                                        setActiveMenuId={setActiveMenuId}
                                        renamingId={renamingId}
                                        setRenamingId={setRenamingId}
                                        tempName={tempName}
                                        setTempName={setTempName}
                                        handleMenuClick={handleMenuClick}
                                        saveRename={saveRename}
                                        deleteFile={deleteFile}
                                        permissions={permissions}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* EXÁMENES SECTION */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 tracking-tight">Exámenes</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Evaluaciones y pruebas</p>
                    </div>

                    {!hasAnyExam ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50">
                            <FileText className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">Sin exámenes</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {uploadExamFiles.map((file, idx: any) => (
                                <FileCard
                                    key={file.id || `upload-exam-${idx}`}
                                    file={{
                                        ...file,
                                        name: file.name || file.title || 'Examen',
                                        type: 'examen'
                                    }}
                                    topic={topic}
                                    subject={subject}
                                    onView={() => {
                                        if (file.url) {
                                            handleViewFile(file);
                                        }
                                    }}
                                    activeMenuId={activeMenuId}
                                    setActiveMenuId={setActiveMenuId}
                                    renamingId={renamingId}
                                    setRenamingId={setRenamingId}
                                    tempName={tempName}
                                    setTempName={setTempName}
                                    handleMenuClick={handleMenuClick}
                                    saveRename={saveRename}
                                    deleteFile={deleteFile}
                                    permissions={permissions}
                                />
                            ))}

                            {aiExamFiles.map((file, idx: any) => (
                                <FileCard
                                    key={file.id || `ai-exam-${idx}`}
                                    file={{
                                        ...file,
                                        name: file.name || file.title || 'Examen',
                                        type: 'examen',
                                        origin: 'AI'
                                    }}
                                    topic={topic}
                                    subject={subject}
                                    onView={() => {
                                        if (file.url) {
                                            handleViewFile(file);
                                        }
                                    }}
                                    activeMenuId={activeMenuId}
                                    setActiveMenuId={setActiveMenuId}
                                    renamingId={renamingId}
                                    setRenamingId={setRenamingId}
                                    tempName={tempName}
                                    setTempName={setTempName}
                                    handleMenuClick={handleMenuClick}
                                    saveRename={saveRename}
                                    deleteFile={deleteFile}
                                    permissions={permissions}
                                />
                            ))}

                            {generatedExams.map((exam, idx: any) => {
                                const subjectGradient = `bg-gradient-to-br ${subjectColor}`;
                                return (
                                    <div
                                        key={exam.id || `generated-exam-${idx}`}
                                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}`, user?.__previewMockData === true ? { state: { prefetchedExam: exam } } : undefined)}
                                        className="group cursor-pointer relative overflow-hidden rounded-3xl shadow-sm hover:shadow-md transition-all duration-500 hover:scale-[1.01]"
                                    >
                                        <div className={`absolute inset-0 ${subjectGradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                            <FileText className="w-28 h-28 text-white absolute -bottom-5 -right-5 rotate-12 opacity-[0.12]" strokeWidth={1.2} />
                                        </div>
                                        <div className="relative z-10 p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                                                    <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-white/70 mb-1">Evaluación del tema</p>
                                                    <h4 className="text-sm font-semibold text-white line-clamp-1">
                                                        {exam.title || 'Examen'}
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-white/80 mb-3">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 border border-white/25 font-semibold">
                                                    <FileText className="w-3 h-3" strokeWidth={1.5} />
                                                    {exam.questions?.length || 0} preguntas
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 border border-white/25 font-semibold">
                                                    <Timer className="w-3 h-3" strokeWidth={1.5} />
                                                    1h
                                                </span>
                                            </div>
                                            <button className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide text-white bg-white/20 border border-white/30 backdrop-blur-sm transition-all hover:bg-white/25 active:scale-95">
                                                Comenzar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- UPLOADS TAB ---
    if (activeTab === 'uploads') {
        const getUploadCategoryLabel = (fileCategory: any) => {
            const category = (fileCategory || '').toLowerCase();
            if (category === 'material-teorico' || category === 'resumen' || !category) return 'Material teórico';
            if (category === 'ejercicios') return 'Ejercicios';
            if (category === 'examenes' || category === 'examen') return 'Exámenes';
            return 'Material teórico';
        };

        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="file" ref={fileInputRef} onChange={handleManualUpload} multiple hidden accept=".pdf,.doc,.docx" />

                    {/* *** CONDITIONAL: Only show upload button if user can edit *** */}
                    {permissions?.canEdit && (
                        <button
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                            className="h-64 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 flex flex-col justify-center items-center text-center group bg-white dark:bg-slate-900 transition-colors"
                        >
                            {uploading ? (
                                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" strokeWidth={1.5} />
                            ) : (
                                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" strokeWidth={1.5} />
                                </div>
                            )}
                            <span className="font-bold text-lg text-slate-700 dark:text-slate-300">
                                {uploading ? 'Subiendo...' : 'Subir Archivo'}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF, DOC, DOCX</span>
                        </button>
                    )}

                    {topic.uploads?.map((upload, idx: any) => (
                        <FileCard
                            key={upload.id || idx}
                            file={upload}
                            badgeLabel={getUploadCategoryLabel(upload.fileCategory)}
                            topic={topic}
                            subject={subject}
                            activeMenuId={activeMenuId}
                            setActiveMenuId={setActiveMenuId}
                            renamingId={renamingId}
                            setRenamingId={setRenamingId}
                            tempName={tempName}
                            setTempName={setTempName}
                            handleMenuClick={handleMenuClick}
                            saveRename={saveRename}
                            deleteFile={deleteFile}
                            onChangeFileCategory={handleChangeFileCategory}
                            permissions={permissions}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // --- QUIZZES TAB ---
    if (activeTab === 'quizzes') {
        const levelOrder = { 
            'básico': 0, 'basico': 0, 'basic': 0, 'principiante': 0, 
            'intermedio': 1, 'medio': 1, 'advanced': 1, 
            'avanzado': 2, 'final': 2, 'experto': 2 
        };
        
        const quizzesByLevel: any = {
            basico: [],
            intermedio: [],
            avanzado: []
        };
        
        (topic.quizzes || []).forEach(quiz => {
            const level = (quiz.level || quiz.type || '').toLowerCase();
            const levelValue = levelOrder[level] !== undefined ? levelOrder[level] : 0;
            const levelKey = levelValue === 0 ? 'basico' : levelValue === 1 ? 'intermedio' : 'avanzado';
            quizzesByLevel[levelKey].push(quiz);
        });

        const subjectColor = subject?.color || 'from-indigo-500 to-purple-600';
        const themeGradient = `bg-gradient-to-br ${subjectColor}`;
        const subtleButtonClass = 'bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 shadow-sm';
        
        const levelConfig = {
            basico: {
                title: 'Básico',
                difficultyLabel: 'Fácil',
                headerBg: `${themeGradient} opacity-85 dark:opacity-90 backdrop-blur-xl`,
                headerAccent: 'text-white/90',
                headerSubtext: 'text-white/70',
                accentBg: 'bg-white/15 backdrop-blur-sm',
                accentText: 'text-white/90',
                difficultyBadge: `${themeGradient} text-white border border-white/30`,
                cardAccent: '',
                stripeWhenCompleted: 'h-0.5',
                progressBg: 'bg-white/20',
                progressFill: 'bg-white/80',
                buttonBg: `${themeGradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.05]`,
                buttonSubtle: subtleButtonClass,
                icon: FlaskConical,
                passColor: 'text-emerald-500 dark:text-emerald-400',
                failColor: 'text-red-500 dark:text-red-400'
            },
            intermedio: {
                title: 'Intermedio',
                difficultyLabel: 'Media',
                headerBg: `${themeGradient} opacity-85 dark:opacity-90 backdrop-blur-xl`,
                headerAccent: 'text-white/90',
                headerSubtext: 'text-white/70',
                accentBg: 'bg-white/15 backdrop-blur-sm',
                accentText: 'text-white/90',
                difficultyBadge: `${themeGradient} text-white border border-white/30`,
                cardAccent: '',
                stripeWhenCompleted: 'h-1',
                progressBg: 'bg-white/20',
                progressFill: 'bg-white/80',
                buttonBg: `${themeGradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.05]`,
                buttonSubtle: subtleButtonClass,
                icon: BookMarked,
                passColor: 'text-emerald-500 dark:text-emerald-400',
                failColor: 'text-red-500 dark:text-red-400'
            },
            avanzado: {
                title: 'Avanzado',
                difficultyLabel: 'Alta',
                headerBg: `${themeGradient} opacity-85 dark:opacity-90 backdrop-blur-xl`,
                headerAccent: 'text-white/90',
                headerSubtext: 'text-white/70',
                accentBg: 'bg-white/15 backdrop-blur-sm',
                accentText: 'text-white/90',
                difficultyBadge: `${themeGradient} text-white border border-white/30`,
                cardAccent: '',
                stripeWhenCompleted: 'h-1.5',
                progressBg: 'bg-white/20',
                progressFill: 'bg-white/80',
                buttonBg: `${themeGradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.05]`,
                buttonSubtle: subtleButtonClass,
                icon: GraduationCap,
                passColor: 'text-emerald-500 dark:text-emerald-400',
                failColor: 'text-red-500 dark:text-red-400'
            }
        };

        const isTeacherAnalyticsView = Boolean(permissions?.canEdit) && !isStudentRole;

        const exportAllTestsMatrixCsv = () => {
            setQuizExportMessage('');
            const quizList = topic.quizzes || [];
            if (!quizList.length) {
                setQuizExportMessage('No hay tests para exportar en este tema.');
                return;
            }

            const studentsMap = new Map();
            quizList.forEach((quiz: any) => {
                const analytics = quizAnalyticsByQuiz?.[quiz.id];
                (analytics?.students || []).forEach((student: any) => {
                    if (!studentsMap.has(student.userId)) {
                        studentsMap.set(student.userId, {
                            userId: student.userId,
                            userName: student.userName || 'Alumno',
                            userEmail: student.userEmail || ''
                        });
                    }
                });
            });

            const students = Array.from(studentsMap.values()).sort((a, b) =>
                String(a.userName || '').localeCompare(String(b.userName || ''), 'es')
            );

            const header = ['Alumno', 'Email', ...quizList.map((quiz) => quiz.title || quiz.name || `Test ${quiz.id}`)];

            const rows = students.map((student: any) => {
                const quizScores = quizList.map((quiz: any) => {
                    const analytics = quizAnalyticsByQuiz?.[quiz.id];
                    const studentRow = (analytics?.students || []).find((entry) => entry.userId === student.userId);
                    return studentRow?.score === null || studentRow?.score === undefined
                        ? 'Sin nota'
                        : `${Number(studentRow.score).toFixed(1)}%`;
                });

                return [student.userName, student.userEmail, ...quizScores];
            });

            const csvRows = [
                header.join(','),
                ...rows.map((row) => row
                    .map((value) => `"${String(value || '').replace(/"/g, '""')}"`)
                    .join(','))
            ];

            try {
                const csvContent = `\uFEFF${csvRows.join('\n')}`;
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const topicName = String(topic?.name || topic?.title || 'tema').replace(/[^a-z0-9-_]/gi, '_');
                link.href = url;
                link.setAttribute('download', `notas_todos_los_tests_${topicName}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();

                setTimeout(() => URL.revokeObjectURL(url), 1000);
                setQuizExportMessage(
                    students.length
                        ? `Exportado: ${students.length} alumno${students.length !== 1 ? 's' : ''} y ${quizList.length} test${quizList.length !== 1 ? 's' : ''}.`
                        : 'Exportado sin filas: todavía no hay alumnos con resultados en los tests de este tema.'
                );
            } catch (error) {
                console.error('[TOPIC_CONTENT] Error exporting all-tests CSV:', error);
                setQuizExportMessage('No se pudo exportar. Revisa permisos del navegador para descargas e intenta de nuevo.');
            }
        };

        const renderLevelSection = (levelKey: any) => {
            // No renderizar si no hay tests en este nivel
            if (quizzesByLevel[levelKey].length === 0) {
                return null;
            }

            const config = levelConfig[levelKey];
            const title = config.title;
            const total = completionByLevel[levelKey].total;
            const completed = completionByLevel[levelKey].completed;
            const averageScore = completionByLevel[levelKey].averageScore;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            const HeaderIcon = config.icon;

            return (
                <div key={levelKey} className="space-y-5">
                    <div className={`${config.headerBg} rounded-[2rem] p-6 md:p-7 lg:p-8 shadow-xl text-white overflow-hidden relative`}>
                        {/* Decorative blur element */}
                        <div className="absolute -top-16 -right-16 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full blur-3xl" />
                        
                        <div className="relative z-10">
                            <div className="flex items-start justify-between gap-4 mb-5">
                                <div className="flex items-start gap-4">
                                    <div className={`${config.accentBg} w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0`}>
                                        <HeaderIcon className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className={`text-3xl md:text-4xl font-black tracking-tight ${config.headerAccent}`}>{title}</h3>
                                        <p className={`${config.headerSubtext} text-sm font-medium mt-1`}>
                                            {completed} de {quizzesByLevel[levelKey].length} completado{completed !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                {completed > 0 && averageScore > 0 && (
                                    <div className="text-right shrink-0 pl-2">
                                        <div className={`${config.headerSubtext} text-xs font-semibold uppercase tracking-widest mb-1`}>Nota media</div>
                                        <div className={`text-2xl md:text-3xl font-black ${config.headerAccent}`}>{averageScore.toFixed(1)}</div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Progress bar */}
                            <div className={`${config.progressBg} h-2 rounded-full overflow-hidden`}>
                                <div
                                    className={`${config.progressFill} h-full rounded-full transition-all duration-700 ease-out`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {quizzesByLevel[levelKey].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {quizzesByLevel[levelKey].map((quiz: any) => {
                                const isCompleted = quiz.score !== undefined && quiz.score !== null;
                                const isPassed = isCompleted && quiz.score >= 50;
                                const isStudent = isStudentRole;
                                const canManageQuiz = Boolean(permissions?.canEdit) && !isStudent;
                                const classAnalytics = quizAnalyticsByQuiz?.[quiz.id] || null;
                                const isAssignment = Boolean(quiz.isAssignment);
                                const shouldEditPrimary = canManageQuiz;

                                const parseDate = (value: any) => {
                                    if (!value) return null;
                                    if (value?.toDate) return value.toDate();
                                    const parsed = new Date(value);
                                    return Number.isNaN(parsed.getTime()) ? null : parsed;
                                };

                                const assignmentStart = parseDate(quiz.assignmentStartAt);
                                const assignmentDue = parseDate(quiz.assignmentDueAt);
                                const now = new Date();
                                const startsInFuture = isAssignment && assignmentStart && now < assignmentStart;
                                const isExpired = isAssignment && assignmentDue && now > assignmentDue;
                                const canStartAssignment = !isAssignment || !isStudent || (!startsInFuture && !isExpired);

                                const assignmentWindowText = isAssignment
                                    ? `${assignmentStart ? `Inicio: ${assignmentStart.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : 'Sin inicio'}${assignmentDue ? ` · Limite: ${assignmentDue.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}`
                                    : '';
                                const quizTitle = quiz.title || quiz.name || 'Test Práctico';
                                const modeLabel = isAssignment ? 'Actividad evaluable' : 'Práctica autocorregible';
                                const canOpenFromCard = !shouldEditPrimary && !isCompleted && canStartAssignment;
                                const openQuizSession = () => navigate(
                                    `/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`,
                                    user?.__previewMockData === true ? { state: { prefetchedQuiz: quiz } } : undefined
                                );
                                const quizCardHeightClass = canManageQuiz
                                    ? 'min-h-[22rem] md:min-h-[23rem]'
                                    : isCompleted
                                    ? 'min-h-[20rem] md:min-h-[21rem]'
                                    : 'min-h-[18.5rem] md:min-h-[19rem]';

                                const quizMenuId = `quiz-card-menu-${quiz.id}`;
                                const isMenuOpen = activeMenuId === quizMenuId;
                                
                                return (
                                    <div
                                        key={quiz.id}
                                        role={canOpenFromCard ? 'button' : undefined}
                                        tabIndex={canOpenFromCard ? 0 : undefined}
                                        onClick={(event: any) => {
                                            if (!canOpenFromCard) return;
                                            const clickedControl = event.target instanceof Element
                                                ? event.target.closest('button, a, input, textarea, select')
                                                : null;
                                            if (clickedControl) return;
                                            openQuizSession();
                                        }}
                                        onKeyDown={(event: any) => {
                                            if (!canOpenFromCard) return;
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                openQuizSession();
                                            }
                                        }}
                                        className={`group relative ${quizCardHeightClass} flex flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/40 transition-all duration-300 hover:scale-[1.02] ${canOpenFromCard ? 'cursor-pointer' : ''} ${config.cardAccent}`}
                                    >
                                        <div className={`absolute inset-0 ${themeGradient} opacity-[0.06] dark:opacity-[0.12] pointer-events-none`} />
                                        <div className={`absolute -top-16 -right-12 w-40 h-40 ${themeGradient} opacity-[0.14] dark:opacity-[0.2] blur-2xl rounded-full pointer-events-none`} />
                                        <div className={`absolute -bottom-16 -left-12 w-32 h-32 ${themeGradient} opacity-[0.1] dark:opacity-[0.16] blur-2xl rounded-full pointer-events-none`} />
                                        <div className={`absolute inset-x-0 top-0 h-1 ${themeGradient}`} />
                                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                                            <HeaderIcon className="w-32 h-32 text-slate-300 dark:text-slate-600 absolute -bottom-4 -right-4 rotate-12 opacity-[0.07]" strokeWidth={1.2} />
                                        </div>

                                        {/* Top accent bar */}
                                        {isCompleted && (
                                            <div className={`absolute inset-x-0 top-0 ${config.stripeWhenCompleted} rounded-t-2xl ${
                                                isPassed ? 'bg-emerald-500/60' : 'bg-red-500/60'
                                            }`} />
                                        )}

                                        {canManageQuiz && (
                                            <div className="absolute top-3 right-3 z-20">
                                                <button
                                                    onClick={(e: any) => {
                                                        e.stopPropagation();
                                                        if (handleMenuClick) {
                                                            handleMenuClick(e, quizMenuId);
                                                        } else {
                                                            setActiveMenuId(isMenuOpen ? null : quizMenuId);
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-full transition-colors text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    title="Acciones del test"
                                                >
                                                    <MoreVertical className="w-4 h-4" strokeWidth={2} />
                                                </button>

                                                {isMenuOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                                                        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-20">
                                                            <button
                                                                onClick={(e: any) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                    navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}/edit`);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400"
                                                            >
                                                                <Pencil className="w-4 h-4" /> Editar
                                                            </button>
                                                            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                                                            <button
                                                                onClick={(e: any) => {
                                                                    e.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                    if (deleteQuiz) deleteQuiz(quiz.id);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-semibold text-red-600 dark:text-red-400"
                                                            >
                                                                <AlertTriangle className="w-4 h-4" /> Eliminar
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        <div className="relative z-10 h-full flex flex-col p-5 md:p-6">
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                    <div className={`p-2.5 rounded-xl border border-white/40 shadow-md ring-1 ring-white/30 backdrop-blur-md ${themeGradient} transition-all`}>
                                                        <HeaderIcon className="w-5 h-5 text-white" strokeWidth={1.6} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400 dark:text-slate-500 mb-1">
                                                            {modeLabel}
                                                        </p>
                                                        <h4 className="text-lg font-bold leading-snug uppercase tracking-tight text-slate-800 dark:text-slate-100 line-clamp-2">
                                                            {quizTitle}
                                                        </h4>
                                                        <div className="mt-2 inline-flex items-center gap-1.5">
                                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${config.difficultyBadge}`}>
                                                                {config.difficultyLabel}
                                                            </span>
                                                            {isAssignment && (
                                                                <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full text-white border border-white/30 ${themeGradient}`}>
                                                                    <ClipboardCheck className="w-3 h-3" strokeWidth={2} />
                                                                    Tarea
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isCompleted && (
                                                    <div className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                                                        isPassed
                                                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                                            : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'
                                                    }`}>
                                                        {isPassed ? 'Aprobado' : 'Revisar'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <div className="inline-flex items-center gap-2 rounded-xl bg-white/85 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-wide shadow-sm">
                                                        <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={1.7} />
                                                        <span>{quiz.questions?.length || 0} preguntas</span>
                                                    </div>
                                                    {isAssignment && (
                                                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 max-w-[15rem]">
                                                            <CalendarDays className="w-3.5 h-3.5" strokeWidth={1.7} />
                                                            <span className="line-clamp-2">{assignmentWindowText}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {isCompleted && (
                                                    <div className={`shrink-0 rounded-2xl px-3 py-2 text-right border ${
                                                        isPassed
                                                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                                                            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                                    }`}>
                                                        <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500 mb-1">Resultado</div>
                                                        <div className={`text-2xl font-black leading-none ${
                                                        isPassed
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                            {Math.round(quiz.score)}%
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {canManageQuiz && (
                                                <div className="mb-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/75 dark:bg-slate-900/55 backdrop-blur-sm px-3 py-2 flex items-center justify-between gap-3 shadow-sm">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-400 dark:text-slate-500">Analitica de clase</p>
                                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                            {classAnalytics?.averageScore === null || classAnalytics?.averageScore === undefined
                                                                ? 'Sin promedio aún'
                                                                : `Promedio: ${classAnalytics.averageScore}%`} · {classAnalytics?.participants || 0} con nota
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedQuizForClassAnalytics(quiz)}
                                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold text-white border border-white/30 shadow-sm ${themeGradient} hover:opacity-95`}
                                                    >
                                                        Ver clase
                                                    </button>
                                                </div>
                                            )}

                                            <div className="mt-auto space-y-2">
                                                <button
                                                    onClick={() => {
                                                        if (shouldEditPrimary) {
                                                            navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}/edit`);
                                                            return;
                                                        }
                                                        if (!canStartAssignment) return;
                                                        openQuizSession();
                                                    }}
                                                    aria-label={
                                                        shouldEditPrimary
                                                            ? 'Editar test'
                                                            : !canStartAssignment
                                                            ? (startsInFuture ? 'Aun no disponible' : 'Plazo cerrado')
                                                            : isCompleted
                                                            ? 'Reintentar test'
                                                            : 'Comenzar test'
                                                    }
                                                    disabled={!shouldEditPrimary && !canStartAssignment}
                                                    className={`w-full flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wide transition-all duration-200 ${
                                                        !shouldEditPrimary && !canStartAssignment
                                                            ? 'py-2.5 text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                                            : shouldEditPrimary
                                                            ? `py-2.5 text-[11px] ${themeGradient} text-white shadow-md hover:shadow-lg active:scale-95`
                                                            : isCompleted
                                                            ? 'py-3.5 text-sm bg-white/85 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 shadow-sm hover:shadow-md'
                                                            : 'h-[6.75rem] text-sm bg-white/85 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-600 shadow-sm hover:shadow-md'
                                                    }`}
                                                >
                                                    {shouldEditPrimary ? (
                                                        <>
                                                            <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                                                            Editar test
                                                        </>
                                                    ) : !canStartAssignment ? (
                                                        <>
                                                            <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                                                            {startsInFuture ? 'Aun no disponible' : 'Plazo cerrado'}
                                                        </>
                                                    ) : isCompleted ? (
                                                        <>
                                                            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                                                            Reintentar test
                                                        </>
                                                    ) : (
                                                        <Play className="w-6 h-6" strokeWidth={2.2} />
                                                    )}
                                                </button>

                                                {isCompleted && !user?.__previewMockData && (
                                                    <button
                                                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}/review`)}
                                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wide bg-white/85 dark:bg-slate-700 border border-slate-200/80 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 shadow-sm hover:shadow-md transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" strokeWidth={2} />
                                                        Ver revision
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>
            );
        };

        return (
            <>
                <div className="space-y-10">
                    {isTeacherAnalyticsView && (topic?.quizzes?.length || 0) > 0 && (
                        <div className="flex flex-col items-end gap-2">
                            <button
                                onClick={exportAllTestsMatrixCsv}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/35 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" strokeWidth={2} />
                                Exportar todos los tests
                            </button>
                            {quizExportMessage && (
                                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    {quizExportMessage}
                                </p>
                            )}
                        </div>
                    )}

                    {renderLevelSection('basico')}
                    {renderLevelSection('intermedio')}
                    {renderLevelSection('avanzado')}

                    {failedQuestions.length > 0 && (
                        <section className="space-y-4 pt-2">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-500 mb-1">Repaso de errores</p>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">Preguntas pendientes de dominar</h3>
                            </div>

                            <button
                                onClick={() => {
                                    sessionStorage.setItem('repasoQuestions', JSON.stringify(failedQuestions));
                                    navigate(`/home/subject/${subjectId}/topic/${topicId}/quizzes/repaso`);
                                }}
                                className="w-full group relative overflow-hidden rounded-[1.8rem] border border-red-200/80 dark:border-red-800/50 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-900/20 p-6 text-left hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shrink-0">
                                            <XCircle className="w-6 h-6" strokeWidth={2} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                                {failedQuestions.length} pregunta{failedQuestions.length !== 1 ? 's' : ''} para repasar
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                                Incluye fallos de todos tus tests de este tema.
                                            </p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider bg-red-600 text-white group-hover:bg-red-700 transition-colors">
                                        Repasar ahora
                                    </span>
                                </div>
                            </button>
                        </section>
                    )}
                </div>

                <QuizClassResultsModal
                    isOpen={Boolean(selectedQuizForClassAnalytics)}
                    onClose={() => setSelectedQuizForClassAnalytics(null)}
                    quiz={selectedQuizForClassAnalytics}
                    analytics={selectedQuizForClassAnalytics ? quizAnalyticsByQuiz?.[selectedQuizForClassAnalytics.id] : null}
                    topicId={topicId}
                    onSaveQuizScoreOverride={onSaveQuizScoreOverride}
                />
            </>
        );
    }

    if (activeTab === 'assignments') {
        if (user?.__previewMockData === true) {
            const mockAssignments = topic.assignments || [];
            return (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 tracking-tight">Tareas del tema</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Vista previa con entregables y fechas simuladas</p>
                    </div>

                    {mockAssignments.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-8 text-center">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No hay tareas simuladas para este tema.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockAssignments.map((assignment: any) => {
                                const dueDate = assignment?.dueAt ? new Date(assignment.dueAt) : null;
                                const dueLabel = dueDate && !Number.isNaN(dueDate.getTime())
                                    ? dueDate.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                    : 'Sin fecha limite';

                                return (
                                    <article
                                        key={assignment.id}
                                        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{assignment.title || 'Tarea'}</h4>
                                            <div className="flex flex-wrap justify-end gap-1.5">
                                                {assignment.visibleToStudents !== false ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300">Visible</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Oculta</span>
                                                )}
                                                {assignment.allowLateDelivery ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300">Fuera de plazo</span>
                                                ) : null}
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 min-h-[2.5rem]">
                                            {assignment.description || 'Sin descripcion.'}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                            <CalendarDays className="w-4 h-4" />
                                            <span>Entrega: {dueLabel}</span>
                                        </div>

                                        {(assignment.instructionFiles || []).length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Archivos de instrucciones</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(assignment.instructionFiles || []).map((file: any, index: any) => (
                                                        <span
                                                            key={`${assignment.id}-instruction-${index}`}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" />
                                                            {file?.name || `Archivo ${index + 1}`}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <TopicAssignmentsSection
                assignments={topic.assignments || []}
                topicId={topicId}
                subjectId={subjectId}
                user={user}
                permissions={permissions}
            />
        );
    }
    
    return null;
};

export default TopicContent;