// src/pages/Topic/components/TopicTabs.jsx
import React from 'react';
import { FileText, Upload, CheckCircle2, Plus } from 'lucide-react';

const TopicTabs = ({ 
    activeTab, 
    setActiveTab, 
    topic, 
    handleCreateCustomPDF, 
    handleCreateCustomQuiz 
}) => {
    return (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {['materials', 'uploads', 'quizzes'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {tab === 'materials' && <><FileText className="w-4 h-4" /> Generados por IA</>}
                    {tab === 'uploads' && <><Upload className="w-4 h-4" /> Mis Archivos</>}
                    {tab === 'quizzes' && <><CheckCircle2 className="w-4 h-4" /> Tests Prácticos</>}
                    {tab !== 'uploads' && activeTab === tab && (
                        <div role="button" onClick={(e) => { e.stopPropagation(); tab === 'materials' ? handleCreateCustomPDF() : handleCreateCustomQuiz(); }} className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-all z-10"><Plus className="w-3 h-3" /></div>
                    )}
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab ? 'bg-white/20 dark:bg-slate-900/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {tab === 'materials' ? topic.pdfs?.length || 0 : tab === 'uploads' ? topic.uploads?.length || 0 : topic.quizzes?.length || 0}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default TopicTabs;