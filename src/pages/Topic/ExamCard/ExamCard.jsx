// src/pages/Topic/ExamCard/ExamCard.jsx
import React, { useMemo } from 'react';
import { ClipboardList, Clock, Play } from 'lucide-react';

const ExamCard = ({ 
    exam, 
    subject, 
    navigate, 
    subjectId, 
    topicId 
}) => {
    const subjectColor = useMemo(() => {
        return subject?.color || 'from-indigo-500 to-purple-600';
    }, [subject?.color]);

    const handleClick = () => {
        navigate(`/home/subject/${subjectId}/topic/${topicId}/exam/${exam.id}`);
    };

    return (
        <article 
            onClick={handleClick}
            className="group cursor-pointer relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/40 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-600"
        >
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${subjectColor} flex items-center justify-center shrink-0`}>
                    <ClipboardList className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        {exam.title || 'Examen'}
                    </h4>
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                    <ClipboardList className="w-3 h-3" strokeWidth={1.5} />
                    {exam.questions?.length || 0} preguntas
                </span>
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={1.5} />
                    1 hora
                </span>
            </div>

            <button
                onClick={handleClick}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${subjectColor} transition-all hover:shadow-md active:scale-[0.98]`}
            >
                <Play className="w-3.5 h-3.5" strokeWidth={1.5} />
                Examen
            </button>
        </article>
    );
};

export default ExamCard;
