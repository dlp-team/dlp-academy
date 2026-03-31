// src/components/modules/QuizEngine/QuizHeader.jsx
import React from 'react';
import { X } from 'lucide-react';

const QuizHeader = React.memo(({ current, total, onClose }: any) => (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-6 flex justify-between items-center">
        <span className="text-xs font-black text-slate-400 dark:text-slate-300 uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/80 backdrop-blur-sm border border-white/50 dark:border-slate-700/70">
            {current} / {total}
        </span>
        <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl transition-all duration-300 text-slate-400 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-300 group"
            aria-label="Cerrar"
        >
            <X className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
        </button>
    </div>
));

QuizHeader.displayName = 'QuizHeader';
export default QuizHeader;