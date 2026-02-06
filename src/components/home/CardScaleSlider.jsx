// src/components/home/CardScaleSlider.jsx
import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';

const CardScaleSlider = ({ cardScale, setCardScale }) => {
    const [showSlider, setShowSlider] = useState(false);
    
    const scales = [
        { value: 75, label: 'S' },
        { value: 100, label: 'M' },
        { value: 125, label: 'L' },
        { value: 150, label: 'XL' }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setShowSlider(!showSlider)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
            >
                <Maximize2 size={16} />
                <span className="hidden sm:inline">Escala</span>
            </button>

            {showSlider && (
                <>
                    {/* Backdrop to close */}
                    <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSlider(false)}
                    />
                    
                    {/* Slider Panel - Positioned to appear over cards */}
                    <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-50 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tamaño de Tarjetas</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{cardScale}%</span>
                        </div>
                        
                        {/* Quick Size Buttons */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {scales.map(scale => (
                                <button
                                    key={scale.value}
                                    onClick={() => setCardScale(scale.value)}
                                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                                        cardScale === scale.value
                                            ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500 dark:ring-indigo-400'
                                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer'
                                    }`}
                                >
                                    {scale.label}
                                </button>
                            ))}
                        </div>

                        {/* Range Slider */}
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="75"
                                max="150"
                                step="25"
                                value={cardScale}
                                onChange={(e) => setCardScale(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Pequeño</span>
                                <span>Grande</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CardScaleSlider;