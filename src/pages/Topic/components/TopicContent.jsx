// src/pages/Topic/components/TopicContent.jsx
import React, { useMemo } from 'react';
import { Loader2, FileText, Upload } from 'lucide-react';
import FileCard from '../FileCard/FileCard';
import QuizCard from '../../../components/modules/QuizCard/QuizCard';

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
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topic.pdfs?.map((pdf, idx) => (
                    <FileCard 
                        key={pdf.id || idx}
                        file={pdf}
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
                {(!topic.pdfs || topic.pdfs.length === 0) && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50">
                        <FileText className="w-12 h-12 mb-3 opacity-20" />
                        <p className="font-medium">Sin materiales</p>
                    </div>
                )}
            </div>
        );
    }

    // --- UPLOADS TAB ---
    if (activeTab === 'uploads') {
        return (
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

        const renderLevelSection = (levelKey, title, icon, gradientBg) => {
            const total = completionByLevel[levelKey].total;
            const completed = completionByLevel[levelKey].completed;
            const averageScore = completionByLevel[levelKey].averageScore;
            const percentage = total > 0 ? (completed / total) * 100 : 0;

            return (
                <div key={levelKey} className="space-y-5">
                    {/* Header del Nivel */}
                    <div className={`bg-gradient-to-r ${gradientBg} rounded-3xl p-8 shadow-lg shadow-slate-200/50 dark:shadow-black/40 ring-1 ring-white/10 dark:ring-white/5`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                    <span className="text-3xl">{icon}</span>
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

                    {/* Grid de Cards */}
                    {quizzesByLevel[levelKey].length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quizzesByLevel[levelKey].map((quiz) => (
                                <QuizCard
                                    key={quiz.id}
                                    quiz={quiz}
                                    navigate={navigate}
                                    subjectId={subjectId}
                                    topicId={topicId}
                                    permissions={permissions}
                                    activeMenuId={activeMenuId}
                                    setActiveMenuId={setActiveMenuId}
                                    handleMenuClick={handleMenuClick}
                                    deleteQuiz={deleteQuiz}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                            <span className="text-2xl opacity-40">{icon}</span>
                            <span className="text-sm font-bold">No hay tests de nivel {title.toLowerCase()}</span>
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="space-y-12">
                {renderLevelSection('basico', 'Básico', '🧪', 'from-emerald-500 to-teal-600')}
                {renderLevelSection('intermedio', 'Intermedio', '📖', 'from-blue-500 to-indigo-600')}
                {renderLevelSection('avanzado', 'Avanzado', '🏆', 'from-violet-500 to-purple-600')}
            </div>
        );
    }
    
    return null;
};

export default TopicContent;