// src/pages/Subject/components/SubjectHeader.jsx
import React from 'react';
import { Home, Pencil, Trash2, ArrowUpDown, X, Save, Search } from 'lucide-react'; // Added Search
import { useNavigate } from 'react-router-dom';
import SubjectIcon, { getIconColor } from '../../../components/ui/SubjectIcon';

const SubjectHeader = ({ 
    subject, 
    onEdit, 
    onDelete, 
    onReorder, 
    isReordering, 
    onCancelReorder, 
    onSaveReorder,
    hasTopics,
    // --- New Props ---
    searchTerm,
    onSearch
}) => {
    const navigate = useNavigate();
    const isModern = subject.cardStyle === 'modern';

    
    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <button 
                onClick={() => navigate('/home')} 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 cursor-pointer transition-colors"
            >
                <Home className="w-5 h-5" /> Volver a Asignaturas
            </button>

            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    {subject.cardStyle === 'modern' ? (
                        // MODERN STYLE:
                        <div className={`w-16 h-16 flex items-center justify-center ${getIconColor(subject.color)}`}>
                            <SubjectIcon iconName={subject.icon} className="w-14 h-14" /> 
                        </div>
                    ) : (
                        // CLASSIC STYLE:
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-sm shadow-indigo-500/20`}>
                            <SubjectIcon iconName={subject.icon} className="w-8 h-8 text-white" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                            {subject.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {subject.topicCount || 0} temas
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    
                    {/* --- EXPANDING SEARCH BAR --- */}
                    <div className={`
                        group flex items-center 
                        bg-white dark:bg-slate-900 
                        border border-gray-200 dark:border-slate-700 
                        rounded-xl shadow-sm 
                        transition-all duration-300 ease-in-out
                        ${searchTerm ? 'w-64' : 'w-12 hover:w-64 focus-within:w-64'}
                        overflow-hidden
                        mr-1
                    `}>
                        <div className="flex-shrink-0 p-3 text-gray-500 dark:text-gray-400 cursor-pointer">
                            <Search className="w-5 h-5" />
                        </div>
                        <input 
                            type="text"
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                            placeholder="Buscar tema o número..."
                            className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-200 text-sm placeholder-gray-400 pr-3"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => onSearch('')}
                                className="p-2 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* --- EDIT BUTTON --- */}
                    <button 
                        onClick={onEdit}
                        className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:scale-105"
                        title="Editar Asignatura"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>

                    {/* --- DELETE BUTTON --- */}
                    <button 
                        onClick={onDelete}
                        className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm transition-all hover:scale-105"
                        title="Eliminar Asignatura"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubjectHeader;