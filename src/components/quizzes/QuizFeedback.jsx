import React from 'react';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { BlockMath } from 'react-katex';

const QuizFeedback = ({ 
    showResult, 
    showExplanation, 
    question, 
    selectedOption, 
    handleCheckAnswer, 
    handleNextQuestion, 
    isLastQuestion,
    topicGradient // 1. Recibimos el gradiente aquí
}) => {
    
    // Valor por defecto si no llega el prop
    const activeGradient = topicGradient || 'from-indigo-600 to-violet-600';

    // Determinar si la respuesta seleccionada es correcta
    const isCorrect = selectedOption === question.correctAnswer;

    return (
        <div className={`fixed bottom-0 left-0 right-0 p-4 md:p-6 border-t z-40 transition-colors duration-300 
            ${showResult 
                ? (isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800') 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
        >
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                
                {/* --- SECCIÓN DE MENSAJE (FEEDBACK) --- */}
                <div className="flex-1 w-full">
                    {!showResult ? (
                        // Estado Normal: Vacío o mensaje sutil
                        <div className="hidden md:block text-slate-400 text-sm font-medium">
                            Selecciona una opción para continuar
                        </div>
                    ) : (
                        // Estado Resultado: Muestra si acertaste o fallaste
                        <div className="animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                                </div>
                                <h3 className={`text-xl font-black ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                                    {isCorrect ? '¡Correcto!' : 'Respuesta incorrecta'}
                                </h3>
                            </div>
                            
                            {/* Explicación Matemática (si existe y se falló o se quiere mostrar siempre) */}
                            {!isCorrect && (
                                <div className="text-slate-600 dark:text-slate-300 text-sm mt-1 ml-11">
                                    <span className="font-bold">Solución correcta:</span> Opción {String.fromCharCode(65 + question.correctAnswer)}
                                    {question.explanation && (
                                        <div className="mt-2 p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-black/5 text-slate-800 dark:text-slate-200">
                                            <BlockMath math={question.explanation} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- BOTÓN DE ACCIÓN --- */}
                <button
                    disabled={!showResult && selectedOption === null}
                    onClick={showResult ? handleNextQuestion : handleCheckAnswer}
                    className={`
                        w-full md:w-auto md:min-w-[240px] py-4 px-8 rounded-2xl font-black text-lg text-white 
                        flex items-center justify-center gap-3 transition-all duration-200
                        shadow-lg active:scale-[0.98] active:translate-y-0.5
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                        ${!showResult 
                            ? `bg-gradient-to-r ${activeGradient} shadow-indigo-500/20 hover:shadow-indigo-500/40` // AQUÍ ESTÁ EL CAMBIO: Gradiente del tema
                            : isCorrect 
                                ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                                : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                        }
                    `}
                >
                    <span>
                        {!showResult 
                            ? 'Comprobar' 
                            : (isLastQuestion ? 'Ver Resultados Finales' : 'Siguiente Pregunta')
                        }
                    </span>
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default QuizFeedback;