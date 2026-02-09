// src/components/topic/TopicContent.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, FileText, Upload, Sparkles } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import FileCard from './FileCard';
import QuizCard from './QuizCard';

const TopicContent = ({ 
    activeTab, 
    topic, 
    uploading, 
    fileInputRef, 
    handleManualUpload, 
    // Props passed down to children
    activeMenuId, setActiveMenuId, renamingId, setRenamingId, tempName, setTempName,
    handleMenuClick, startRenaming, saveRename, deleteFile, handleViewFile, getFileVisuals,
    deleteQuiz, getQuizVisuals, navigate, subjectId, topicId, user
}) => {
    const [completionByLevel, setCompletionByLevel] = useState({
        basico: { completed: 0, total: 0, averageScore: 0 },
        intermedio: { completed: 0, total: 0, averageScore: 0 },
        avanzado: { completed: 0, total: 0, averageScore: 0 }
    });

    // Leer quiz_results y calcular porcentaje de completitud por nivel
    useEffect(() => {
        if (!user || !subjectId || !topicId || !topic.quizzes) return;

        const loadCompletion = async () => {
            try {
                const levelOrder = { 'básico': 0, 'basico': 0, 'basic': 0, 'principiante': 0, 'intermedio': 1, 'medio': 1, 'advanced': 1, 'avanzado': 2, 'final': 2, 'experto': 2 };
                
                // Agrupar quizzes por nivel
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

                // Contar quiz_results completados por el usuario y calcular promedio
                const completion = {
                    basico: { completed: 0, total: quizzesByLevel.basico.length, scores: [] },
                    intermedio: { completed: 0, total: quizzesByLevel.intermedio.length, scores: [] },
                    avanzado: { completed: 0, total: quizzesByLevel.avanzado.length, scores: [] }
                };

                // Verificar cada quiz para ver si el usuario lo completó y leer su puntuación
                for (const [levelKey, quizzes] of Object.entries(quizzesByLevel)) {
                    for (const quiz of quizzes) {
                        try {
                            const resultRef = doc(db, 'subjects', subjectId, 'topics', topicId, 'quiz_results', `${quiz.id}_${user.uid}`);
                            const resultSnap = await getDoc(resultRef);
                            if (resultSnap.exists()) {
                                completion[levelKey].completed += 1;
                                const score = Number(resultSnap.data().score) || 0;
                                completion[levelKey].scores.push(score);
                            }
                        } catch (error) {
                            console.error(`Error checking quiz ${quiz.id}:`, error);
                        }
                    }
                }

                // Calcular promedio por nivel
                const finalCompletion = {
                    basico: { 
                        completed: completion.basico.completed, 
                        total: completion.basico.total,
                        averageScore: completion.basico.scores.length > 0 ? Math.round(completion.basico.scores.reduce((a, b) => a + b, 0) / completion.basico.scores.length) : 0
                    },
                    intermedio: { 
                        completed: completion.intermedio.completed, 
                        total: completion.intermedio.total,
                        averageScore: completion.intermedio.scores.length > 0 ? Math.round(completion.intermedio.scores.reduce((a, b) => a + b, 0) / completion.intermedio.scores.length) : 0
                    },
                    avanzado: { 
                        completed: completion.avanzado.completed, 
                        total: completion.avanzado.total,
                        averageScore: completion.avanzado.scores.length > 0 ? Math.round(completion.avanzado.scores.reduce((a, b) => a + b, 0) / completion.avanzado.scores.length) : 0
                    }
                };

                setCompletionByLevel(finalCompletion);
            } catch (error) {
                console.error('Error loading completion:', error);
            }
        };

        loadCompletion();
    }, [user, subjectId, topicId, topic.quizzes]);
    
    // --- MATERIALS TAB ---
    if (activeTab === 'materials') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topic.status === 'generating' && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-200 dark:border-blue-800 p-8 shadow-sm dark:shadow-md flex flex-col justify-center items-center h-64 animate-pulse">
                        <Loader2 className="w-12 h-12 text-blue-500 dark:text-blue-400 animate-spin mb-4" /><h4 className="font-bold text-2xl text-slate-900 dark:text-slate-100">Generando...</h4>
                    </div>
                )}
                {topic.pdfs?.map((pdf, idx) => (
                    <FileCard 
                        key={pdf.id || idx}
                        file={pdf}
                        topic={topic}
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
                    />
                ))}
                {(!topic.pdfs || topic.pdfs.length === 0) && topic.status !== 'generating' && (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/50"><FileText className="w-12 h-12 mb-3 opacity-20" /><p className="font-medium">Sin materiales</p></div>
                )}
            </div>
        );
    }

    // --- UPLOADS TAB ---
    if (activeTab === 'uploads') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="file" ref={fileInputRef} onChange={handleManualUpload} multiple hidden accept=".pdf,.doc,.docx" />
                <button onClick={() => fileInputRef.current.click()} disabled={uploading} className="h-64 rounded-3xl border-3 border-dashed border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 flex flex-col justify-center items-center text-center group bg-white dark:bg-slate-900">
                    {uploading ? <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" /> : <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-6 group-hover:scale-110"><Upload className="w-10 h-10 text-indigo-600 dark:text-indigo-400" /></div>}
                    <span className="font-bold text-xl text-slate-700 dark:text-slate-300">{uploading ? 'Subiendo...' : 'Subir Archivo'}</span>
                </button>
                {topic.uploads?.map((upload, idx) => (
                    <FileCard 
                        key={upload.id || idx}
                        file={upload}
                        topic={topic}
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
                    />
                ))}
            </div>
        );
    }

    // --- QUIZZES TAB ---
    if (activeTab === 'quizzes') {
        // Agrupar quizzes por nivel
        const levelOrder = { 'básico': 0, 'basico': 0, 'basic': 0, 'principiante': 0, 'intermedio': 1, 'medio': 1, 'advanced': 1, 'avanzado': 2, 'final': 2, 'experto': 2 };
        
        const quizzesByLevel = {
            basico: [],
            intermedio: [],
            avanzado: []
        };
        
        (topic.quizzes || []).forEach(quiz => {
            const level = (quiz.level || quiz.type || '').toLowerCase();
            const levelValue = levelOrder[level] !== undefined ? levelOrder[level] : 0; // Defaultear a básico si no se reconoce
            const levelKey = levelValue === 0 ? 'basico' : levelValue === 1 ? 'intermedio' : 'avanzado';
            quizzesByLevel[levelKey].push(quiz);
        });

        const renderLevelSection = (levelKey, title, icon, gradientBg, borderColor) => {
            const total = completionByLevel[levelKey].total;
            const completed = completionByLevel[levelKey].completed;
            const averageScore = completionByLevel[levelKey].averageScore;
            const percentage = total > 0 ? (completed / total) * 100 : 0;

            return (
            <div key={levelKey} className="space-y-4">
                {/* Header del Nivel */}
                <div className={`bg-gradient-to-r ${gradientBg} rounded-2xl p-8 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{icon}</span>
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tight">{title}</h3>
                                <p className="text-white/80 text-sm font-medium">{completed}/{quizzesByLevel[levelKey].length} {quizzesByLevel[levelKey].length === 1 ? 'test' : 'tests'} completado{completed !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        {completed > 0 && averageScore > 0 && (
                            <div className="text-right">
                                <div className="text-white/60 text-xs font-semibold uppercase tracking-wider">Nota media</div>
                                <div className="text-3xl font-black text-white">{averageScore}</div>
                            </div>
                        )}
                    </div>
                    <div className={`h-1.5 bg-white/20 rounded-full overflow-hidden mt-4`}>
                        <div className={`h-full bg-white/80 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>

                {/* Grid de Cards */}
                {quizzesByLevel[levelKey].length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quizzesByLevel[levelKey].map((quiz, idx) => (
                            <QuizCard 
                                key={idx}
                                quiz={quiz}
                                activeMenuId={activeMenuId}
                                setActiveMenuId={setActiveMenuId}
                                handleMenuClick={handleMenuClick}
                                deleteQuiz={deleteQuiz}
                                getQuizVisuals={getQuizVisuals}
                                navigate={navigate}
                                subjectId={subjectId}
                                topicId={topicId}
                                isCompleted={completionByLevel[levelKey].completed > idx}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-8 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50">
                        <span className="text-sm font-medium">No hay tests {title.toLowerCase()}</span>
                    </div>
                )}
            </div>
            );
        };

        return (
            <div className="space-y-12">
                {renderLevelSection('basico', 'Básico', '🧪', 'from-green-400 to-green-600', 'border-green-200')}
                {renderLevelSection('intermedio', 'Intermedio', '📖', 'from-blue-400 to-blue-600', 'border-blue-200')}
                {renderLevelSection('avanzado', 'Avanzado', '🏆', 'from-purple-400 to-purple-600', 'border-purple-200')}
            </div>
        );
    }
    
    return null;
};

export default TopicContent;