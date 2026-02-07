// src/components/topic/QuizCard.jsx
import React from 'react';
import { MoreHorizontal, Edit2, Trash2, Timer, Play } from 'lucide-react';

const QuizCard = ({ 
    quiz, 
    activeMenuId, 
    setActiveMenuId, 
    handleMenuClick, 
    deleteQuiz, 
    getQuizVisuals, 
    navigate, 
    subjectId, 
    topicId 
}) => {
    const { icon: Icon, bgFade, textAccent, iconBg, border, level } = getQuizVisuals(quiz.type);
    const isMenuOpen = activeMenuId === quiz.id;

    return (
        <div className="group relative h-64 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default bg-white border border-slate-100 shadow-sm">
            
            {/* FADE BACKGROUND BEHIND ICON */}
            <div className={`absolute -top-24 -left-24 w-64 h-64 rounded-full ${bgFade} opacity-70 blur-3xl group-hover:opacity-100 transition-opacity`}></div>

            {/* ICONO GRANDE (FADE IN PAGE BLEND) */}
            <div className="absolute top-6 left-6 z-20">
                <div className={`p-3.5 rounded-2xl ${iconBg} ${textAccent} shadow-sm`}>
                    <Icon className="w-8 h-8" />
                </div>
            </div>

            {/* MENU */}
            <div className="absolute top-4 right-4 z-30">
                <button onClick={(e) => handleMenuClick(e, quiz.id)} className="p-2 rounded-full transition-colors text-slate-400 hover:bg-slate-50 hover:text-slate-600">
                    <MoreHorizontal className="w-6 h-6" />
                </button>
                
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 text-slate-700 animate-in fade-in zoom-in-95">
                            <button 
                                onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}/edit`)} 
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 flex items-center gap-2 font-medium"
                            >
                                <Edit2 className="w-4 h-4 text-indigo-600" /> Editar Test
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button 
                                onClick={() => deleteQuiz(quiz.id)} 
                                className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                            >
                                <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="relative h-full p-8 flex flex-col justify-end z-10">
                <div className="mt-auto">
                    <span className={`absolute top-6 right-16 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${bgFade} ${border} ${textAccent}`}>
                        {level}
                    </span>
                    <h3 className="text-3xl font-extrabold leading-tight mb-2 text-slate-800">{quiz.name || "Test Práctico"}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 font-medium"><Timer className="w-4 h-4" /> 15 min aprox</div>
                    
                    <button 
                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`)} 
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg ${iconBg} ${textAccent} hover:brightness-95`}
                    >
                        <Play className="w-4 h-4 fill-current" /> Comenzar Test
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizCard;