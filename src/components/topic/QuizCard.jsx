import React from 'react';
import { Timer, Play, RotateCcw, Trophy, XCircle } from 'lucide-react';

const QuizCard = ({ 
    quiz, 
    navigate, 
    subjectId, 
    topicId 
}) => {
    // Verificamos si existe puntuación
    const hasScore = quiz.score !== undefined && quiz.score !== null;
    
    // Calculamos si aprobó (50% o más)
    const isPassed = hasScore && quiz.score >= 50;

    const getQuizIcon = (type, level) => {
        if (level) {
            const levelLower = level.toLowerCase();
            if (levelLower.includes('básico') || levelLower.includes('basico') || levelLower.includes('principiante')) 
                return { icon: '🧪', color: 'from-green-400 to-green-600', level: 'Básico' };
            if (levelLower.includes('intermedio') || levelLower.includes('medio'))
                return { icon: '📖', color: 'from-blue-400 to-blue-600', level: 'Intermedio' };
            if (levelLower.includes('avanzado') || levelLower.includes('experto'))
                return { icon: '🏆', color: 'from-purple-400 to-purple-600', level: 'Avanzado' };
        }
        
        switch(type) {
            case 'basic': return { icon: '🧪', color: 'from-green-400 to-green-600', level: 'Básico' };
            case 'advanced': return { icon: '📖', color: 'from-blue-400 to-blue-600', level: 'Intermedio' };
            case 'final': return { icon: '🏆', color: 'from-purple-400 to-purple-600', level: 'Avanzado' };
            default: return { icon: '📝', color: 'from-gray-400 to-gray-600', level: 'Test' };
        }
    };

    const { icon, level: displayLevel, color } = getQuizIcon(quiz.type, quiz.level);

    return (
        <div className="group relative h-64 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default">
            
            {/* --- FONDO CON DEGRADADO --- */}
            <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-90 transition-opacity group-hover:opacity-100`}></div>
            
            {/* --- CONTENIDO PRINCIPAL --- */}
            <div className="relative h-full p-8 flex flex-col justify-between text-white">
                
                {/* --- HEADER: PUNTUACIÓN (IZQ) Y NIVEL (DER) --- */}
                <div className="flex justify-between items-start w-full relative z-20">
                    
                    {/* 1. BADGE DE PUNTUACIÓN (ARRIBA IZQUIERDA) */}
                    <div>
                        {hasScore && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border border-white/20 backdrop-blur-md bg-white animate-in zoom-in duration-300">
                                {/* ICONOS CON COLOR FIJO */}
                                {isPassed ? (
                                    <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                ) : (
                                    <XCircle className="w-4 h-4 text-red-500 fill-red-50" />
                                )}
                                
                                {/* TEXTO CON COLOR CONDICIONAL */}
                                <span className={`text-xs font-black ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                    {quiz.score}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 2. BADGE DE NIVEL (ARRIBA DERECHA) */}
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                        <span className="text-xs font-bold uppercase tracking-wider">{displayLevel}</span>
                    </div>
                </div>

                {/* --- ICONO GRANDE DE FONDO (DECORATIVO) --- */}
                <div className="text-6xl opacity-20 absolute top-4 left-4 rotate-12 group-hover:rotate-0 transition-transform duration-500 z-0">
                    {icon}
                </div>

                {/* --- FOOTER DE LA TARJETA --- */}
                <div className="z-10 mt-auto">
                    <h3 className="text-3xl font-extrabold leading-tight mb-2 line-clamp-1" title={quiz.name}>
                        {quiz.name || "Test Práctico"}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-6 font-medium">
                        <Timer className="w-4 h-4" /> 
                        <span>15 min aprox</span>
                        {hasScore && <span className="text-white/60">• Completado</span>}
                    </div>

                    {/* BOTÓN DE ACCIÓN */}
                    <button 
                        onClick={() => navigate(`/home/subject/${subjectId}/topic/${topicId}/quiz/${quiz.id}`)}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg
                            ${hasScore 
                                ? 'bg-white/90 text-slate-900 hover:bg-white' 
                                : 'bg-white text-indigo-900 hover:bg-indigo-50'
                            }`}
                    >
                        {hasScore ? (
                            <>
                                <RotateCcw className="w-4 h-4" /> Reintentar
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current" /> Comenzar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizCard;