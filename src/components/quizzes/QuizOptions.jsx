import React from 'react';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';
import { RenderLatex } from './QuizCommon';

const QuizOptions = ({ 
    options, 
    selectedOption, 
    handleOptionSelect, 
    showResult, 
    correctAnswer,
    topicGradient // Recibimos ej: "from-purple-600 to-blue-500"
}) => {

    // Valor por defecto por seguridad
    const activeGradient = topicGradient || 'from-indigo-600 to-violet-600';

    return (
        <div className="grid grid-cols-1 gap-4 mb-24">
            {options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === correctAnswer;
                const isWrongSelection = isSelected && !isCorrect;

                // --- ESTILOS BASE (Estado Normal) ---
                // Usamos bordes y textos neutros para no complicar el hover dinámico
                let containerClasses = "border-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50";
                
                let circleClasses = "border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 bg-transparent";
                
                let icon = <Circle className="w-5 h-5 text-slate-300" />;

                // --- LÓGICA DE ESTADOS ---

                if (showResult) {
                    // FASE 2: RESULTADOS (Prioridad absoluta a Verde/Rojo)
                    if (isCorrect) {
                        // Correcto: Verde Esmeralda
                        containerClasses = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-400 shadow-md scale-[1.01]";
                        circleClasses = "bg-emerald-600 border-emerald-600 text-white";
                        icon = <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
                    } else if (isWrongSelection) {
                        // Error: Rojo
                        containerClasses = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-400 opacity-90";
                        circleClasses = "bg-red-500 border-red-500 text-white";
                        icon = <XCircle className="w-6 h-6 text-red-500 dark:text-red-400" />;
                    } else {
                        // Resto: Apagados
                        containerClasses = "border-slate-100 dark:border-slate-800 opacity-40 grayscale";
                    }
                } else if (isSelected) {
                    // FASE 1: SELECCIÓN ACTIVA (Usa el DEGRADADO del tema)
                    // Aquí está la magia: inyectamos el gradiente directamente
                    containerClasses = `bg-gradient-to-r ${activeGradient} border-transparent text-white shadow-xl scale-[1.02] ring-1 ring-white/20`;
                    
                    // El círculo de la letra se vuelve blanco semitransparente para que se vea el gradiente de fondo
                    circleClasses = "bg-white/20 border-white/30 text-white font-bold backdrop-blur-sm";
                    
                    // Icono blanco
                    icon = <CheckCircle2 className="w-6 h-6 text-white animate-in zoom-in duration-300" />;
                }

                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={showResult}
                        className={`
                            group relative w-full p-5 rounded-2xl text-left font-medium text-lg 
                            transition-all duration-300 ease-out 
                            flex items-center gap-5 outline-none
                            ${containerClasses}
                        `}
                    >
                        {/* Círculo con Letra (A, B, C...) */}
                        <div className={`
                            w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                            ${circleClasses}
                        `}>
                            {String.fromCharCode(65 + idx)}
                        </div>

                        {/* Texto de la respuesta */}
                        <div className="flex-1 leading-snug">
                            <RenderLatex text={option} />
                        </div>

                        {/* Icono de estado (Check/X/Circle) */}
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

export default QuizOptions;