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
    const subjectGradient = subject.color || 'from-blue-500 to-indigo-600';
    
    // Only show menu if user has edit or delete permissions
    const hasAnyMenuAction = permissions?.showEditUI || permissions?.showDeleteUI;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* BREADCRUMBS */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 flex-wrap">
                    <button onClick={() => navigate('/home')} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
                        <Home className="w-4 h-4" strokeWidth={1.5} /> Inicio
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                    <button onClick={() => navigate(`/home/subject/${subjectId}`)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{subject.name}</button>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                    <span className="text-slate-900 dark:text-slate-100 font-bold">Tema {topic.number}</span>
                    
                    {/* *** NEW: Viewer Badge *** */}
                    {permissions?.isViewer && (
                        <span className="ml-2 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-100 dark:border-amber-800 flex items-center gap-1">
                            <Eye className="w-3 h-3" strokeWidth={1.5} /> Solo lectura
                        </span>
                    )}
                </div>
                
                {/* *** MODIFIED: Only show menu button if user has permissions *** */}
                {hasAnyMenuAction && (
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" strokeWidth={1.5} /></button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                                    {/* *** CONDITIONAL: Show rename only if canEdit *** */}
                                    {permissions?.showEditUI && (
                                        <button onClick={() => { setIsEditingTopic(true); setEditTopicData({ name: topic.name || topic.title || '' }); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                            <Edit2 className="w-4 h-4" strokeWidth={1.5} /> Renombrar Tema
                                        </button>
                                    )}
                                    
                                    {/* *** CONDITIONAL: Show AI generation only if canEdit *** */}
                                    {permissions?.showEditUI && (
                                        <button onClick={handleGenerateQuizSubmit} className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 flex items-center gap-3 text-purple-600 dark:text-purple-400 font-bold">
                                            <Wand2 className="w-4 h-4" strokeWidth={1.5} /> Generar con IA
                                        </button>
                                    )}
                                    
                                    {/* *** CONDITIONAL: Show divider only if both edit and delete exist *** */}
                                    {permissions?.showEditUI && permissions?.showDeleteUI && (
                                        <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                    )}
                                    
                                    {/* *** CONDITIONAL: Show delete only if canDelete (owner only) *** */}
                                    {permissions?.showDeleteUI && (
                                        <button onClick={() => { handleDeleteTopic(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400">
                                            <Trash2 className="w-4 h-4" strokeWidth={1.5} /> Eliminar Tema
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Professional Hero Header */}
            <div className="-mx-6 px-6 py-2 md:py-3 mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="rounded-[1.8rem] md:rounded-[2.2rem] border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/95 dark:bg-slate-900/80 shadow-[0_18px_36px_-22px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_40px_-24px_rgba(2,6,23,0.75)] backdrop-blur-sm px-4 py-4 md:px-6 md:py-5 lg:px-7 lg:py-6">
                        <div className="flex flex-col gap-4 md:gap-5">
                            <div className="flex items-start gap-4 md:gap-5">
                                <div className={`h-24 w-24 md:h-28 md:w-28 rounded-3xl bg-gradient-to-br ${subjectGradient} shadow-[0_14px_28px_-14px_rgba(15,23,42,0.45)] border border-white/70 shrink-0 flex items-center justify-center`}>
                                    <span className="text-5xl md:text-6xl font-black text-white leading-none drop-shadow-[0_3px_6px_rgba(15,23,42,0.28)]">
                                        {String(topic.number).padStart(2, '0')}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col gap-2 md:gap-3 pt-1">
                                    <div className="flex items-center gap-2 flex-wrap text-slate-500">
                                        <div className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-300">
                                            <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                                            <span>Actualizado hoy</span>
                                        </div>
                                        <span className="text-slate-300 dark:text-slate-600">•</span>
                                        <span className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 truncate">{subject.name}</span>
                                    </div>

                                    {isEditingTopic ? (
                                        <div className="flex gap-2 max-w-3xl">
                                            <input
                                                type="text"
                                                value={editTopicData.name}
                                                onChange={(e) => setEditTopicData({ ...editTopicData, name: e.target.value })}
                                                className="flex-1 text-2xl md:text-4xl font-black border border-slate-300 dark:border-slate-600 rounded-2xl px-5 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400/50 dark:focus:ring-slate-500/50"
                                                autoFocus
                                            />
                                            <button onClick={handleSaveTopicTitle} className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl transition-colors border border-slate-900 dark:border-slate-100"><CheckCircle2 className="w-5 h-5" strokeWidth={1.5} /></button>
                                            <button onClick={() => setIsEditingTopic(false)} className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-2xl transition-colors border border-slate-300 dark:border-slate-600"><X className="w-5 h-5" strokeWidth={1.5} /></button>
                                        </div>
                                    ) : (
                                        <h1 className="text-[2.4rem] md:text-[3.2rem] lg:text-[3.8rem] font-black text-slate-900 dark:text-slate-100 leading-[0.95] tracking-tight capitalize break-words">
                                            {topic.name || topic.title}
                                        </h1>
                                    )}
                                </div>
                            </div>

                            {globalProgress?.total > 0 && (
                                <div className="pl-0 md:pl-[8.5rem] lg:pl-[9.5rem]">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <p className="text-[10px] md:text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 font-bold">Progreso</p>
                                        <p className="text-sm md:text-base font-black text-slate-700 dark:text-slate-200">{globalProgress.completed}/{globalProgress.total} ({Math.round(globalProgress.percentage)}%)</p>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${subjectGradient} rounded-full transition-all duration-1000 ease-out`}
                                            style={{ width: `${globalProgress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicHeader;