// src/pages/Topic/ExamCard/ExamCard.jsx
import React, { useMemo } from 'react';
import { ClipboardList, Clock, Play, ChevronRight } from 'lucide-react';

const ExamCard = ({ 
    exam, 
    subject, 
    navigate, 
    subjectId, 
    topicId, 
    permissions 
}) => {
    const subjectColor = useMemo(() => {
        return subject?.color || 'from-indigo-500 to-purple-600';
    }, [subject?.color]);

    const handleClick = () => {
        navigate(`/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}`);
    };

    return (
        <article className="group relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-900 p-6 shadow-md transition-all duration-300 hover:shadow-lg">
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
                <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${subjectColor} opacity-20 blur-2xl -translate-y-1/3 translate-x-1/3`} />
            </div>

            <div className="relative z-10">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subjectColor} flex items-center justify-center shrink-0 shadow-lg`}>
                        <ClipboardList className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-medium text-white leading-tight line-clamp-2 mb-2">
                            {exam.examen_titulo || 'Examen'}
                        </h4>
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <span className="opacity-85 font-medium">{exam.preguntas?.length || 0} preguntas</span>
                            <span className="opacity-40">·</span>
                            <span className="opacity-80 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> 1 hora
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleClick}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r ${subjectColor} transition-all hover:brightness-110 active:scale-[0.99]`}
                >
                    <Play className="w-4 h-4" />
                    Comenzar Examen
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </article>
    );
};

export default ExamCard;
