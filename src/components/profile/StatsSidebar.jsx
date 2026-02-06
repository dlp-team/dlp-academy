// src/components/profile/StatsSidebar.jsx
import React from 'react';
import { TrendingUp, Trophy, Award } from 'lucide-react';

const StatsSidebar = () => {
    return (
        <div className="space-y-8">
            {/* Progress Mockup */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-lg font-bold text-gray-800">Tu Progreso</h2>
                </div>
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg mb-2">Próximamente</div>
                    <p className="text-sm font-semibold text-gray-800">Las estadísticas aparecerán aquí</p>
                </div>
                <div className="space-y-4 opacity-50 blur-[1px]">
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full w-2/3"></div></div>
                </div>
            </div>

            {/* Ranking Mockup */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6 relative z-0">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-lg font-bold">Ranking Global</h2>
                </div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg mb-2">En Construcción</div>
                </div>
                <Award className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
            </div>
        </div>
    );
};

export default StatsSidebar;