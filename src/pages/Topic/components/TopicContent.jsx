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
    ChevronRight,
    Clock
} from 'lucide-react';
import FileCard from '../FileCard/FileCard';
import ExamCard from '../ExamCard/ExamCard';

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
                    ? Math.round(stats.basico.scores.reduce((a, b) => a + b, 0) / stats.basico.scores.length) 
                    : 0
            },
            intermedio: {
                completed: stats.intermedio.completed,
                total: stats.intermedio.total,
                averageScore: stats.intermedio.scores.length > 0 
                    ? Math.round(stats.intermedio.scores.reduce((a, b) => a + b, 0) / stats.intermedio.scores.length) 
                    : 0
            },
            avanzado: {
                completed: stats.avanzado.completed,
                total: stats.avanzado.total,
                averageScore: stats.avanzado.scores.length > 0 
                    ? Math.round(stats.avanzado.scores.reduce((a, b) => a + b, 0) / stats.avanzado.scores.length) 
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

        const formulasGuide = topic.pdfs?.find(f =>
            ['summary', 'resumen'].includes((f.type || '').toLowerCase())
        ) || topic.pdfs?.[0];

        let hasFormulas = false;
        if (formulasGuide?.studyGuide) {
            try {
                const sections = typeof formulasGuide.studyGuide === 'string'
                    ? JSON.parse(formulasGuide.studyGuide)
                    : formulasGuide.studyGuide;
                hasFormulas = Array.isArray(sections) && sections.some(s => s.formulas?.length > 0);
            } catch {
                hasFormulas = false;
            }
        }

        const subjectColor = subject?.color || 'from-indigo-500 to-purple-600';
        const themeGradient = `bg-gradient-to-br ${subjectColor}`;
        const subtleButtonClass = 'bg-slate-100/95 hover:bg-slate-200 dark:bg-slate-700/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-600 shadow-sm';
        
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
                                        <div className={`${config.headerSubtext} text-xs font-semibold uppercase tracking-widest mb-1`}>Desempeño</div>
                                        <div className={`text-2xl md:text-3xl font-black ${config.headerAccent}`}>{averageScore}%</div>
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

                    {hasFormulas && formulasGuide?.id && (
                        <button
                            onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/formulas/${formulasGuide.id}`)}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:p-5 w-full text-left transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                    <Calculator className="w-5 h-5 text-slate-700 dark:text-slate-300" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Fórmulas</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Consulta antes de resolver</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-400 transition-colors shrink-0" strokeWidth={2} />
                            </div>
                        </button>
                    )}

                    {quizzesByLevel[levelKey].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {quizzesByLevel[levelKey].map((quiz) => {
                                const isCompleted = quiz.score !== undefined && quiz.score !== null;
                                const isPassed = isCompleted && quiz.score >= 50;
                                
                                return (
                                    <div
                                        key={quiz.id}
                                        className={`relative h-full flex flex-col overflow-hidden rounded-[1.4rem] border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-600 ${config.cardAccent}`}
                                    >
                                        {/* Premium color layers inspired by TopicCard/StudyGuide */}
                                        <div className={`absolute inset-x-0 top-0 h-1.5 ${themeGradient}`} />
                                        <div className={`absolute -top-14 -right-12 w-36 h-36 ${themeGradient} opacity-[0.10] dark:opacity-[0.16] blur-2xl rounded-full pointer-events-none`} />
                                        <div className={`absolute -bottom-12 -left-10 w-28 h-28 ${themeGradient} opacity-[0.07] dark:opacity-[0.12] blur-2xl rounded-full pointer-events-none`} />

                                        {/* Top accent bar */}
                                        {isCompleted && (
                                            <div className={`absolute inset-x-0 top-0 ${config.stripeWhenCompleted} rounded-t-2xl ${
                                                isPassed ? 'bg-emerald-500/60' : 'bg-red-500/60'
                                            }`} />
                                        )}

                                        <div className="relative z-10 h-full flex flex-col p-5 md:p-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                                    <div className={`w-10 h-10 rounded-xl ${themeGradient} shadow-md flex items-center justify-center shrink-0`}>
                                                        <HeaderIcon className="w-5 h-5 text-white" strokeWidth={1.8} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight tracking-tight">
                                                            {quiz.name || 'Test Práctico'}
                                                        </h4>
                                                        <div className="mt-2 inline-flex items-center gap-1.5">
                                                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${config.difficultyBadge}`}>
                                                                {config.difficultyLabel}
                                                            </span>
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

                                            {/* Middle row */}
                                            <div className="mb-5 flex items-end justify-between gap-3">
                                                <div className="inline-flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                    <ClipboardCheck className="w-3.5 h-3.5" strokeWidth={1.7} />
                                                    <span>{quiz.questions?.length || 0} preguntas</span>
                                                </div>
                                                {isCompleted && (
                                                    <div className={`text-2xl font-black leading-none ${
                                                        isPassed
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                        {Math.round(quiz.score)}%
                                                    </div>
                                                )}
                                            </div>

                                            {/* CTA Button */}
                                            <button
                                                onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`)}
                                                className={`mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                                    isCompleted
                                                        ? `${config.buttonSubtle} hover:shadow-md active:scale-95`
                                                        : `${config.buttonBg} active:scale-95`
                                                }`}
                                            >
                                                {isCompleted ? (
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
            </div>
        );
    }
    
    return null;
};

export default TopicContent;