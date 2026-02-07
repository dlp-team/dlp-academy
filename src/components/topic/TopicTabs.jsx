// src/components/topic/TopicTabs.jsx
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
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center gap-2 border whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                    {tab === 'materials' && <><FileText className="w-4 h-4" /> Generados por IA</>}
                    {tab === 'uploads' && <><Upload className="w-4 h-4" /> Mis Archivos</>}
                    {tab === 'quizzes' && <><CheckCircle2 className="w-4 h-4" /> Tests Prácticos</>}
                    {tab !== 'uploads' && activeTab === tab && (
                        <div role="button" onClick={(e) => { e.stopPropagation(); tab === 'materials' ? handleCreateCustomPDF() : handleCreateCustomQuiz(); }} className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-all z-10"><Plus className="w-3 h-3" /></div>
                    )}
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] ${activeTab === tab ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                        {tab === 'materials' ? topic.pdfs?.length || 0 : tab === 'uploads' ? topic.uploads?.length || 0 : topic.quizzes?.length || 0}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default TopicTabs;