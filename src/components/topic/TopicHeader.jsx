// src/components/topic/TopicHeader.jsx
import React from 'react';
import { Home, ChevronRight, MoreVertical, Edit2, Wand2, Trash2, Calendar, CheckCircle2, X } from 'lucide-react';

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
    handleDeleteTopic 
}) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* BREADCRUMBS */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <button onClick={() => navigate('/home')} className="hover:text-indigo-600 flex items-center gap-1"><Home className="w-4 h-4" /> Inicio</button>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <button onClick={() => navigate(`/home/subject/${subjectId}`)} className="hover:text-indigo-600">{subject.name}</button>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className="text-slate-900 font-bold">Tema {topic.number}</span>
                </div>
                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 rounded-lg"><MoreVertical className="w-5 h-5 text-slate-500" /></button>
                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                <button onClick={() => { setIsEditingTopic(true); setEditTopicData({ title: topic.title }); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700"><Edit2 className="w-4 h-4" /> Renombrar Tema</button>
                                <button onClick={handleGenerateQuizSubmit} className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-3 text-purple-600 font-bold"><Wand2 className="w-4 h-4" /> Generar con IA</button>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button onClick={() => { handleDeleteTopic(); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600"><Trash2 className="w-4 h-4" /> Eliminar Tema</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* HERO HEADER */}
            <div className="mb-10 pb-8 border-b border-slate-200">
                <div className="flex flex-col md:flex-row items-start gap-8">
                    <div className={`w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br ${topic.color || 'from-blue-500 to-indigo-600'} flex items-center justify-center shadow-2xl shadow-indigo-500/20`}>
                        <span className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-md">{topic.number || '#'}</span>
                    </div>
                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">{subject.course}</span>
                            <div className="flex items-center gap-1 text-slate-400 text-sm font-medium"><Calendar className="w-4 h-4" /><span>Actualizado hoy</span></div>
                        </div>
                        {isEditingTopic ? (
                            <div className="flex gap-2 max-w-lg">
                                <input type="text" value={editTopicData.title} onChange={(e) => setEditTopicData({ ...editTopicData, title: e.target.value })} className="flex-1 text-2xl font-bold border border-slate-300 rounded-lg px-3 py-2" autoFocus />
                                <button onClick={handleSaveTopicTitle} className="bg-indigo-600 text-white px-4 rounded-lg"><CheckCircle2 /></button>
                                <button onClick={() => setIsEditingTopic(false)} className="bg-slate-200 text-slate-600 px-4 rounded-lg"><X /></button>
                            </div>
                        ) : (
                            <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight capitalize leading-tight">{topic.title}</h2>
                        )}
                        <div className="flex items-center gap-4 max-w-md pt-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 ${topic.quizzes?.length > 0 ? 'w-1/2' : 'w-1/12'}`}></div></div>
                            <span className="text-xs font-bold text-slate-500">{topic.quizzes?.length > 0 ? '50%' : '10%'} Completado</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopicHeader;