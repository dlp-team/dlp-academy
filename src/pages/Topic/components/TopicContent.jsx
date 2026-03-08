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
    ChevronRight
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

        return (
            <div className="space-y-8">
                {mainGuide && (
                    <div className="flex gap-6 items-stretch">
                    {/* LEFT: Guía Completa */}
                    <button
                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${mainGuide.id}`)}
                        className="flex-1 group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] text-left"
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 group-hover:opacity-100 transition-opacity`} />
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <BookOpen className="w-40 h-40 text-white absolute -bottom-8 -right-8 opacity-10 rotate-12" />
                        </div>
                        <div className="relative z-10 p-8 flex flex-col justify-between h-full min-h-[12rem]">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
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
                            className="group relative w-40 shrink-0 overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.03]"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-90 group-hover:opacity-100 transition-opacity`} />
                            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 p-6">
                                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Calculator className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-white font-bold text-sm text-center">Fórmulas</span>
                            </div>
                        </button>
                    )}
                </div>
                )}
            </div>
        );
    }

    // --- UPLOADS TAB ---
    if (activeTab === 'uploads') {
        const hasExams = topic.exams?.length > 0;

        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="file" ref={fileInputRef} onChange={handleManualUpload} multiple hidden accept=".pdf,.doc,.docx" />

                    {/* *** CONDITIONAL: Only show upload button if user can edit *** */}
                    {permissions?.canEdit && (
                        <button
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploading}
                            className="h-64 rounded-3xl border-3 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex flex-col justify-center items-center text-center group bg-white dark:bg-slate-900"
                        >
                            {uploading ? (
                                <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
                            ) : (
                                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110">
                                    <Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            )}
                            <span className="font-bold text-xl text-slate-700 dark:text-slate-300">
                                {uploading ? 'Subiendo...' : 'Subir Archivo'}
                            </span>
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

                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 mb-4">
                        Exámenes de Prueba
                    </h3>

                    {hasExams ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {topic.exams.map(exam => (
                                <ExamCard
                                    key={exam.id}
                                    exam={exam}
                                    subject={subject}
                                    navigate={navigate}
                                    subjectId={subjectId}
                                    topicId={topicId}
                                    permissions={permissions}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                            <ClipboardCheck className="w-7 h-7 opacity-40" />
                            <span className="text-sm font-semibold">No hay exámenes disponibles para este tema</span>
                        </div>
                    )}
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

        const levelConfig = {
            basico: {
                title: 'Básico',
                headerBg: 'bg-emerald-600',
                accentBg: 'bg-emerald-500/20',
                accentText: 'text-emerald-600 dark:text-emerald-400',
                buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
                buttonSubtle: 'bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
                icon: FlaskConical
            },
            intermedio: {
                title: 'Intermedio',
                headerBg: 'bg-blue-600',
                accentBg: 'bg-blue-500/20',
                accentText: 'text-blue-600 dark:text-blue-400',
                buttonBg: 'bg-blue-600 hover:bg-blue-500',
                buttonSubtle: 'bg-blue-500/15 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300',
                icon: BookMarked
            },
            avanzado: {
                title: 'Avanzado',
                headerBg: 'bg-fuchsia-600',
                accentBg: 'bg-fuchsia-500/20',
                accentText: 'text-fuchsia-600 dark:text-fuchsia-400',
                buttonBg: 'bg-fuchsia-600 hover:bg-fuchsia-500',
                buttonSubtle: 'bg-fuchsia-500/15 hover:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300',
                icon: GraduationCap
            }
        };

        const renderLevelSection = (levelKey) => {
            const config = levelConfig[levelKey];
            const title = config.title;
            const total = completionByLevel[levelKey].total;
            const completed = completionByLevel[levelKey].completed;
            const averageScore = completionByLevel[levelKey].averageScore;
            const percentage = total > 0 ? (completed / total) * 100 : 0;
            const HeaderIcon = config.icon;

            return (
                <div key={levelKey} className="space-y-5">
                    <div className={`${config.headerBg} rounded-[2rem] p-8 shadow-lg shadow-slate-200/50 dark:shadow-black/40`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                    <HeaderIcon className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight">{title}</h3>
                                    <p className="text-white/80 text-sm font-medium mt-0.5">
                                        {completed}/{quizzesByLevel[levelKey].length} {quizzesByLevel[levelKey].length === 1 ? 'test' : 'tests'} completado{completed !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            {completed > 0 && averageScore > 0 && (
                                <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3">
                                    <div className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Nota media</div>
                                    <div className="text-3xl font-black text-white leading-tight">{averageScore}%</div>
                                </div>
                            )}
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-5">
                            <div
                                className="h-full bg-white/90 rounded-full transition-all duration-700 ease-out"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>

                    {hasFormulas && formulasGuide?.id && (
                        <button
                            onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/formulas/${formulasGuide.id}`)}
                            className="group relative overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 w-full text-left transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${config.accentBg} flex items-center justify-center`}>
                                    <Calculator className={`w-6 h-6 ${config.accentText}`} />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-800 dark:text-slate-100">Fórmulas del Nivel {title}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Abrir bloque de fórmulas antes de resolver tests</p>
                                </div>
                            </div>
                        </button>
                    )}

                    {quizzesByLevel[levelKey].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quizzesByLevel[levelKey].map((quiz) => (
                                <div
                                    key={quiz.id}
                                    className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-900 p-6 shadow-md"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.accentBg} ${config.accentText}`}>
                                                {title}
                                            </span>
                                            {quiz.score !== undefined && quiz.score !== null && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${quiz.score >= 50 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                                    {quiz.score >= 50 ? 'Aprobado' : 'No aprobado'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className="text-lg font-medium text-white leading-tight mb-3 line-clamp-2">
                                        {quiz.name || 'Test Práctico'}
                                    </h4>

                                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-5">
                                        <Timer className="w-4 h-4" />
                                        <span className="opacity-80">15 min aprox</span>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`)}
                                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                                            quiz.score !== undefined && quiz.score !== null
                                                ? `${config.buttonSubtle}`
                                                : `${config.buttonBg} text-white`
                                        }`}
                                    >
                                        {quiz.score !== undefined && quiz.score !== null ? (
                                            <>
                                                <RotateCcw className="w-4 h-4" /> Reintentar
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4" /> Comenzar <ChevronRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                            <ClipboardCheck className="w-7 h-7 opacity-40" />
                            <span className="text-sm font-bold">No hay tests disponibles</span>
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="space-y-12">
                {renderLevelSection('basico')}
                {renderLevelSection('intermedio')}
                {renderLevelSection('avanzado')}
            </div>
        );
    }
    
    return null;
};

export default TopicContent;