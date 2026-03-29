// src/pages/Topic/components/TopicContent.jsx
import React, { useMemo } from 'react';
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

const TopicContent = ({ 
    activeTab, 
    topic, 
    subject,
    uploading, 
    fileInputRef, 
    handleManualUpload,
    activeMenuId, setActiveMenuId, renamingId, setRenamingId, tempName, setTempName,
    handleMenuClick, startRenaming, saveRename, deleteFile, handleViewFile, getFileVisuals,
    deleteQuiz, getQuizVisuals, navigate, subjectId, topicId, user,
    failedQuestions = [],
    permissions // *** NEW: Permission flags ***
}) => {
    
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
        
        const stats = {
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

        if (!mainGuide) {
            return (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50">
                    <FileText className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium">Sin materiales</p>
                </div>
            );
        }

        const hasExams = topic.exams?.length > 0;

        return (
            <div className="space-y-10">
                {mainGuide && (
                    <div className="flex gap-6 items-stretch">
                    {/* LEFT: Guía Completa */}
                    <button
                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${mainGuide.id}`)}
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
                            {topic.exams.map(exam => {
                                const subjectGradient = `bg-gradient-to-br ${subjectColor}`;
                                return (
                                    <div
                                        key={exam.id}
                                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}`)}
                                        className="group cursor-pointer relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/30"
                                    >
                                        <div className={`absolute top-0 inset-x-0 h-1 ${subjectGradient}`} />
                                        <div className="p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className={`${subjectGradient} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                                                    <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                        {exam.title || 'Examen'}
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-3 h-3" strokeWidth={1.5} />
                                                    {exam.questions?.length || 0} preguntas
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Timer className="w-3 h-3" strokeWidth={1.5} />
                                                    1h
                                                </span>
                                            </div>
                                            <button className={`w-full py-2 rounded-lg text-xs font-semibold text-white transition-all ${subjectGradient} hover:shadow-md active:scale-95`}>
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
        const aiSummaryFiles = topic.pdfs?.filter(f => ['summary', 'resumen'].includes((f.type || '').toLowerCase())) || [];
        const mainGuide = aiSummaryFiles[0] || null;
        const extraAiSummaryFiles = aiSummaryFiles.filter((f) => f.id !== mainGuide?.id);
        const uploadResumenFiles = topic.uploads?.filter(u => u.fileCategory === 'resumen') || [];
        const resumenCards = [...extraAiSummaryFiles, ...uploadResumenFiles];

        const uploadExamFiles = topic.uploads?.filter(u => u.fileCategory === 'examen') || [];
        const generatedExams = topic.exams || [];
        const hasAnyExam = uploadExamFiles.length > 0 || generatedExams.length > 0;

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

        return (
            <div className="space-y-10">
                {/* RESÚMENES SECTION */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 tracking-tight">Resúmenes</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Apuntes y referencias de estudio</p>
                    </div>
                    {!mainGuide && resumenCards.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50">
                            <BookOpen className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium">Sin resúmenes</p>
                        </div>
                    ) : (
                        <>
                            {mainGuide && (
                                <div className="flex gap-6 items-stretch">
                                    <button
                                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${mainGuide.id}`)}
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

                            {resumenCards.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {resumenCards.map((file, idx) => {
                                        const subjectGradient = `bg-gradient-to-br ${subjectColor}`;
                                        return (
                                            <div
                                                key={file.id || `resumen-${idx}`}
                                                onClick={() => {
                                                    if (file.studyGuide) {
                                                        navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${file.id}`);
                                                        return;
                                                    }
                                                    if (file.url) {
                                                        handleViewFile(file);
                                                    }
                                                }}
                                                className="group cursor-pointer relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/30"
                                            >
                                                <div className={`absolute top-0 inset-x-0 h-1 ${subjectGradient}`} />
                                                <div className="p-4">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className={`${subjectGradient} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                                                            <BookOpen className="w-5 h-5 text-white" strokeWidth={1.5} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                                {file.title || file.name || 'Resumen'}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <button className={`w-full py-2 rounded-lg text-xs font-semibold text-white transition-all ${subjectGradient} hover:shadow-md active:scale-95`}>
                                                        Ver
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
                            {uploadExamFiles.map((file, idx) => {
                                const subjectGradient = `bg-gradient-to-br ${subjectColor}`;
                                return (
                                    <div
                                        key={file.id || `upload-exam-${idx}`}
                                        onClick={() => {
                                            if (file.url) {
                                                handleViewFile(file);
                                            }
                                        }}
                                        className="group cursor-pointer relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/30"
                                    >
                                        <div className={`absolute top-0 inset-x-0 h-1 ${subjectGradient}`} />
                                        <div className="p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className={`${subjectGradient} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                                                    <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                        {file.title || file.name || 'Examen'}
                                                    </h4>
                                                </div>
                                            </div>
                                            <button className={`w-full py-2 rounded-lg text-xs font-semibold text-white transition-all ${subjectGradient} hover:shadow-md active:scale-95`}>
                                                Ver
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}

                            {generatedExams.map((exam, idx) => {
                                const subjectGradient = `bg-gradient-to-br ${subjectColor}`;
                                return (
                                    <div
                                        key={exam.id || `generated-exam-${idx}`}
                                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}`)}
                                        className="group cursor-pointer relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/30"
                                    >
                                        <div className={`absolute top-0 inset-x-0 h-1 ${subjectGradient}`} />
                                        <div className="p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className={`${subjectGradient} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                                                    <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                                                        {exam.title || 'Examen'}
                                                    </h4>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-3 h-3" strokeWidth={1.5} />
                                                    {exam.questions?.length || 0} preguntas
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Timer className="w-3 h-3" strokeWidth={1.5} />
                                                    1h
                                                </span>
                                            </div>
                                            <button className={`w-full py-2 rounded-lg text-xs font-semibold text-white transition-all ${subjectGradient} hover:shadow-md active:scale-95`}>
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

                    {topic.uploads?.map((upload, idx) => (
                        <FileCard
                            key={upload.id || idx}
                            file={upload}
                            topic={topic}
                            subject={subject}
                            activeMenuId={activeMenuId}
                            setActiveMenuId={setActiveMenuId}
                            renamingId={renamingId}
                            setRenamingId={setRenamingId}
                            tempName={tempName}
                            setTempName={setTempName}
                            handleMenuClick={handleMenuClick}
                            startRenaming={startRenaming}
                            saveRename={saveRename}
                            deleteFile={deleteFile}
                            handleViewFile={handleViewFile}
                            getFileVisuals={getFileVisuals}
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
        
        const quizzesByLevel = {
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
                difficultyBadge: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30',
                cardAccent: 'border-l-2 border-l-orange-300 dark:border-l-orange-500/50',
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
                difficultyBadge: 'bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-500/20 dark:text-orange-200 dark:border-orange-400/40',
                cardAccent: 'border-l-[3px] border-l-orange-400 dark:border-l-orange-400/70',
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
                difficultyBadge: 'bg-orange-200 text-orange-900 border border-orange-300 dark:bg-orange-500/25 dark:text-orange-100 dark:border-orange-300/50',
                cardAccent: 'border-l-4 border-l-orange-500 dark:border-l-orange-300/80',
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

        const renderLevelSection = (levelKey) => {
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
                            {quizzesByLevel[levelKey].map((quiz) => {
                                const isCompleted = quiz.score !== undefined && quiz.score !== null;
                                const isPassed = isCompleted && quiz.score >= 50;
                                const isStudent = user?.role === 'student' || permissions?.isViewer;
                                const canManageQuiz = Boolean(permissions?.canEdit) && !isStudent;
                                const isAssignment = Boolean(quiz.isAssignment);
                                const isAdmin = user?.role === 'admin';
                                const isCreatorTeacher = !isStudent && Boolean(permissions?.canEdit) && (
                                    quiz?.createdBy === user?.uid ||
                                    quiz?.ownerId === user?.uid ||
                                    topic?.ownerId === user?.uid
                                );
                                const shouldEditPrimary = Boolean(isAdmin || isCreatorTeacher);

                                const parseDate = (value) => {
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

                                const quizMenuId = `quiz-card-menu-${quiz.id}`;
                                const isMenuOpen = activeMenuId === quizMenuId;
                                
                                return (
                                    <div
                                        key={quiz.id}
                                        className={`relative h-full flex flex-col overflow-hidden rounded-[1.8rem] border border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-900 shadow-[0_16px_35px_-24px_rgba(15,23,42,0.4)] hover:shadow-[0_24px_48px_-26px_rgba(15,23,42,0.5)] transition-all duration-300 group hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 ${config.cardAccent}`}
                                    >
                                        <div className={`absolute inset-x-0 top-0 h-24 ${themeGradient} opacity-[0.08] dark:opacity-[0.16] pointer-events-none`} />
                                        <div className={`absolute inset-x-0 top-0 h-1.5 ${themeGradient}`} />
                                        <div className={`absolute -top-14 -right-12 w-36 h-36 ${themeGradient} opacity-[0.10] dark:opacity-[0.16] blur-2xl rounded-full pointer-events-none`} />
                                        <div className={`absolute -bottom-12 -left-10 w-28 h-28 ${themeGradient} opacity-[0.07] dark:opacity-[0.12] blur-2xl rounded-full pointer-events-none`} />

                                        {/* Top accent bar */}
                                        {isCompleted && (
                                            <div className={`absolute inset-x-0 top-0 ${config.stripeWhenCompleted} rounded-t-2xl ${
                                                isPassed ? 'bg-emerald-500/60' : 'bg-red-500/60'
                                            }`} />
                                        )}

                                        {canManageQuiz && (
                                            <div className="absolute top-3 right-3 z-20">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (handleMenuClick) {
                                                            handleMenuClick(e, quizMenuId);
                                                        } else {
                                                            setActiveMenuId(isMenuOpen ? null : quizMenuId);
                                                        }
                                                    }}
                                                    className="p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                                    title="Acciones del test"
                                                >
                                                    <MoreVertical className="w-4 h-4" strokeWidth={2} />
                                                </button>

                                                {isMenuOpen && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                                                        <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-20">
                                                            <button
                                                                onClick={(e) => {
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
                                                                onClick={(e) => {
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
                                                    <div className={`w-11 h-11 rounded-2xl ${themeGradient} shadow-md ring-1 ring-white/60 dark:ring-white/10 flex items-center justify-center shrink-0`}>
                                                        <HeaderIcon className="w-5 h-5 text-white" strokeWidth={1.8} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-slate-400 dark:text-slate-500 mb-1">
                                                            {modeLabel}
                                                        </p>
                                                        <h4 className="text-lg font-black text-slate-900 dark:text-white line-clamp-2 leading-tight tracking-tight">
                                                            {quizTitle}
                                                        </h4>
                                                        <div className="mt-2 inline-flex items-center gap-1.5">
                                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${config.difficultyBadge}`}>
                                                                {config.difficultyLabel}
                                                            </span>
                                                            {isAssignment && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-200 dark:border-indigo-400/40">
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

                                            <div className="mb-5 flex items-start justify-between gap-3">
                                                <div className="flex flex-col gap-2">
                                                    <div className="inline-flex items-center gap-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
                                                        <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={1.7} />
                                                        <span>{quiz.questions?.length || 0} preguntas</span>
                                                    </div>
                                                    {isAssignment && (
                                                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 max-w-[15rem]">
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

                                            <div className="mt-auto space-y-2">
                                                <button
                                                    onClick={() => {
                                                        if (shouldEditPrimary) {
                                                            navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}/edit`);
                                                            return;
                                                        }
                                                        if (!canStartAssignment) return;
                                                        navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`);
                                                    }}
                                                    disabled={!shouldEditPrimary && !canStartAssignment}
                                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                                        !shouldEditPrimary && !canStartAssignment
                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                                            : shouldEditPrimary
                                                            ? `${themeGradient} text-white shadow-md hover:shadow-lg active:scale-95`
                                                            : isCompleted
                                                            ? `${config.buttonSubtle} hover:shadow-md active:scale-95`
                                                            : `${config.buttonBg} active:scale-95`
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
                                                        <>
                                                            <Play className="w-3.5 h-3.5" strokeWidth={2} />
                                                            Comenzar test
                                                        </>
                                                    )}
                                                </button>

                                                {isCompleted && (
                                                    <button
                                                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}/review`)}
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" strokeWidth={2} />
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
            <div className="space-y-10">
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
        );
    }

    if (activeTab === 'assignments') {
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