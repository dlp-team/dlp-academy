// src/components/subject/SubjectHeader.jsx
import React from 'react';
import { Home, Pencil, Trash2, ArrowUpDown, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubjectIcon from '../modals/SubjectIcon';

const SubjectHeader = ({ 
    subject, 
    onEdit, 
    onDelete, 
    onReorder, 
    isReordering, 
    onCancelReorder, 
    onSaveReorder,
    hasTopics 
}) => {
    const navigate = useNavigate();

    return (
        <>
            <button 
                onClick={() => navigate('/home')} 
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 cursor-pointer transition-colors"
            >
                <Home className="w-5 h-5" /> Volver a Asignaturas
            </button>

            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center shadow-sm`}>
                        <SubjectIcon iconName={subject.icon} className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{subject.course}</p>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">{subject.name}</h2>
                    </div>
                </div>
                
                <div className="flex gap-2 items-center self-end sm:self-auto">
                    {!isReordering && (
                        <>
                            <button onClick={onEdit} className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 shadow-sm transition-colors" title="Editar">
                                <Pencil className="w-5 h-5" />
                            </button>
                            <button onClick={onDelete} className="p-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm transition-colors" title="Eliminar">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {!isReordering && hasTopics && (
                        <>
                            <div className="h-8 w-px bg-gray-300 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                            <button onClick={onReorder} className="p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-300 shadow-sm transition-colors">
                                <ArrowUpDown className="w-5 h-5" /> <span className="hidden sm:inline">Reordenar</span>
                            </button>
                        </>
                    )}
                    
                    {isReordering && (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                            <button onClick={onCancelReorder} className="p-3 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-2 text-gray-700 dark:text-gray-300 shadow-sm transition-colors">
                                <X className="w-5 h-5" /> Cancelar
                            </button>
                            <button onClick={onSaveReorder} className="p-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 flex items-center gap-2 shadow-sm transition-colors">
                                <Save className="w-5 h-5" /> Guardar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default SubjectHeader;