// src/pages/Topic/ExamCard/ExamCard.jsx
import React, { useMemo } from 'react';
import { ClipboardList, Clock } from 'lucide-react';

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
        <button
            onClick={handleClick}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02] text-left"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${subjectColor} opacity-85 group-hover:opacity-100 transition-opacity`} />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <ClipboardList className="w-28 h-28 text-white absolute -bottom-4 -right-4 opacity-10 rotate-6" />
            </div>
            <div className="relative z-10 p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-black text-white truncate">
                        {exam.examen_titulo || 'Examen'}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-white/70 text-xs font-bold">
                            {exam.preguntas?.length || 0} preguntas
                        </span>
                        <span className="text-white/40">·</span>
                        <span className="text-white/70 text-xs font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 1 hora
                        </span>
                    </div>
                </div>
                <span className="text-white/60 text-xs font-bold group-hover:text-white/90 transition-colors shrink-0">
                    Empezar →
                </span>
            </div>
        </button>
    );
};

export default ExamCard;
