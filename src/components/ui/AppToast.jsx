// src/components/ui/AppToast.jsx
import React from 'react';
import { Brain, X } from 'lucide-react';

const AppToast = ({ show, message, onClose }) => {
    if (!show) return null;
    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 w-full max-w-sm px-4">
            <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm tracking-tight">IA Trabajando</h4>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">{message}</p>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default AppToast;