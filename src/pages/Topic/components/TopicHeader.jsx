// src/pages/Topic/components/TopicHeader.jsx
import React from 'react';
import { Home, ChevronRight, MoreVertical, Edit2, Wand2, Trash2, Calendar, CheckCircle2, X, Eye } from 'lucide-react';

const TopicHeader = ({ 
    subject, 
    topic, 
    subjectId, 
    navigate, 
    showMenu, 
    setShowMenu, 
    isEditingTopic, 
    setIsEditingTopic, 
    editTopicData, 
    setEditTopicData, 
    handleSaveTopicTitle, 
    handleGenerateQuizSubmit, 
    handleDeleteTopic,
    globalProgress,
    permissions // *** NEW: Permission flags ***
}) => {
    // Definimos un color de respaldo por si la asignatura no tiene uno
    const subjectGradient = subject.color || 'from-indigo-500 to-purple-600';
    
    // Only show menu if user has edit or delete permissions
    const hasAnyMenuAction = permissions?.showEditUI || permissions?.showDeleteUI;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* BREADCRUMBS */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <button onClick={() => navigate('/home')} className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"><Home className="w-4 h-4" /> Inicio</button>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    <button onClick={() => navigate(`/home/subject/${subjectId}`)} className="hover:text-indigo-600 dark:hover:text-indigo-400">{subject.name}</button>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    <span className="text-slate-900 dark:text-slate-100 font-bold">Tema {topic.number}</span>
                    
                    {/* *** NEW: Viewer Badge *** */}
                    {permissions?.isViewer && (
                        <span className="ml-2 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-100 dark:border-amber-800 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Solo lectura
                        </span>
                    )}
                </div>
                
                {/* *** MODIFIED: Only show menu button if user has permissions *** */}
                {hasAnyMenuAction && (
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" /></button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                                    {/* *** CONDITIONAL: Show rename only if canEdit *** */}
                                    {permissions?.showEditUI && (
                                        <button onClick={() => { setIsEditingTopic(true); setEditTopicData({ name: topic.name || topic.title || '' }); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                            <Edit2 className="w-4 h-4" /> Renombrar Tema
                                        </button>
                                    )}
                                    
                                    {/* *** CONDITIONAL: Show AI generation only if canEdit *** */}
                                    {permissions?.showEditUI && (
                                        <button onClick={handleGenerateQuizSubmit} className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-3 text-purple-600 dark:text-purple-400 font-bold">
                                            <Wand2 className="w-4 h-4" /> Generar con IA
                                        </button>
                                    )}
                                    
                                    {/* *** CONDITIONAL: Show divider only if both edit and delete exist *** */}
                                    {permissions?.showEditUI && permissions?.showDeleteUI && (
                                        <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                    )}
                                    
                                    {/* *** CONDITIONAL: Show delete only if canDelete (owner only) *** */}
                                    {permissions?.showDeleteUI && (
                                        <button onClick={() => { handleDeleteTopic(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400">
                                            <Trash2 className="w-4 h-4" /> Eliminar Tema
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* HERO HEADER */}
            <div className="mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row items-start gap-8">
                    {/* CAMBIO 1: El color del cuadro del número ahora viene de subject.color */}
                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${subjectGradient} flex items-center justify-center shadow-2xl shadow-indigo-500/20`}>
                        <span className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-md">{topic.number || '#'}</span>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-100 dark:border-indigo-800">{subject.course}</span>
                            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-sm font-medium"><Calendar className="w-4 h-4" /><span>Actualizado hoy</span></div>
                        </div>
                        {isEditingTopic ? (
                            <div className="flex gap-2 max-w-lg">
                                <input type="text" value={editTopicData.name} onChange={(e) => setEditTopicData({ ...editTopicData, name: e.target.value })} className="flex-1 text-2xl font-bold border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100" autoFocus />
                                <button onClick={handleSaveTopicTitle} className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 rounded-lg"><CheckCircle2 /></button>
                                <button onClick={() => setIsEditingTopic(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 rounded-lg"><X /></button>
                            </div>
                        ) : (
                            <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight capitalize leading-tight">{topic.name || topic.title}</h2>
                        )}
                        
                        {/* BARRA DE PROGRESO */}
                        <div className="flex items-center gap-4 max-w-md pt-2">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    /* CAMBIO 2: El color de la barra de progreso ahora viene de subject.color */
                                    className={`h-full bg-gradient-to-r ${subjectGradient} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: `${globalProgress?.percentage || 0}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {globalProgress?.total > 0 
                                    ? `${globalProgress.completed}/${globalProgress.total} (${Math.round(globalProgress.percentage)}%)`
                                    : '0/0 (0%)'
                                }
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicHeader;