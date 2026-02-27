// src/components/home/CardScaleSlider.jsx
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';

const CardScaleSlider = ({ cardScale, setCardScale, onOverlayToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef(null);
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
    const PANEL_WIDTH = 288;
    const VIEWPORT_MARGIN = 8;

    
    // 4 scales: XS (60% - 5 cards), S (75% - 4 cards), M (100% - 3 cards), L (125% - 2 cards)
    const scales = [
        { value: 60, label: 'XS', name: 'Extra Pequeño (5 tarjetas)' },
        { value: 75, label: 'S', name: 'Pequeño (4 tarjetas)' },
        { value: 100, label: 'M', name: 'Mediano (3 tarjetas)' },
        { value: 125, label: 'L', name: 'Grande (2 tarjetas)' }
    ];

    // 2. CREATE HELPER
    const handleSetIsOpen = (newState) => {
        setIsOpen(newState);
        if (onOverlayToggle) onOverlayToggle(newState);
    };

    useLayoutEffect(() => {
        if (!isOpen || !triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const panelHeight = 300;

        const defaultLeft = rect.right - PANEL_WIDTH;
        const oppositeLeft = rect.left;

        let left = defaultLeft;
        if (left < VIEWPORT_MARGIN) {
            left = oppositeLeft;
        }
        left = Math.min(
            Math.max(left, VIEWPORT_MARGIN),
            Math.max(VIEWPORT_MARGIN, window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN)
        );

        const defaultTop = rect.bottom + 8;
        const oppositeTop = rect.top - panelHeight - 8;

        let top = defaultTop;
        if (top + panelHeight > window.innerHeight - VIEWPORT_MARGIN) {
            top = oppositeTop;
        }
        top = Math.min(
            Math.max(top, VIEWPORT_MARGIN),
            Math.max(VIEWPORT_MARGIN, window.innerHeight - panelHeight - VIEWPORT_MARGIN)
        );

        setPanelPos({ top, left });
    }, [isOpen]);

    return (
        <div className="relative" ref={triggerRef}>
            <button
                onClick={() => handleSetIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-sm"
            >
                <Maximize2 size={16} />
                <span className="hidden sm:inline">Escala</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close */}
                    <div 
                        className="fixed inset-0 z-10"
                        onClick={() => handleSetIsOpen(false)}
                    />
                    
                    {/* Slider Panel */}
                    <div
                        className="fixed bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl p-4 z-50 w-72 animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{ top: panelPos.top, left: panelPos.left }}
                    >
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
                                    title={scale.name}
                                >
                                    {scale.label}
                                </button>
                            ))}
                        </div>

                        {/* Range Slider */}
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="60"
                                max="125"
                                step="5"
                                value={cardScale}
                                onChange={(e) => setCardScale(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                            />
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>5 tarjetas</span>
                                <span>2 tarjetas</span>
                            </div>
                        </div>
                        
                        
                        {/* Helper Text */}
                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                            {cardScale === 60 && '~5 tarjetas por fila'}
                            {cardScale === 75 && '~4 tarjetas por fila'}
                            {cardScale === 100 && '~3 tarjetas por fila'}
                            {cardScale === 125 && '~2 tarjetas por fila'}
                            {cardScale !== 60 && cardScale !== 75 && cardScale !== 100 && cardScale !== 125 && 'Personalizado'}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CardScaleSlider;