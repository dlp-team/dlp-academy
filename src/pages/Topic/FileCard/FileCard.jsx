// src/pages/Topic/FileCard/FileCard.jsx
import React, { useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FileText, MoreHorizontal, FileEdit, Trash2, 
    Check, X, Maximize2, Download, 
    BookOpen, Calculator, FileQuestion, Pencil // Añadido Pencil para el icono de editar
} from 'lucide-react';

const FileCard = ({ 
    file, 
    topic,
    subject,
    activeMenuId, 
    setActiveMenuId, 
    renamingId, 
    setRenamingId, 
    tempName, 
    setTempName, 
    handleMenuClick, 
    startRenaming, 
    saveRename, 
    deleteFile, 
    getFileVisuals,
    permissions // *** NEW: Permission flags ***
}) => {
    const navigate = useNavigate();
    const { subjectId, topicId } = useParams();

    // ID único por instancia de FileCard para evitar que se abran todos los menús a la vez
    const menuId = useRef(`file-menu-${Math.random().toString(36).substr(2, 9)}`).current;

    const cardColor = subject?.color || topic?.color || 'from-blue-500 to-indigo-600';
    
    const colorName = useMemo(() => {
        const firstPart = cardColor.split(' ')[0] || '';
        return firstPart.replace('from-', '').split('-')[0] || 'indigo';
    }, [cardColor]);

    let Icon = FileText;
    let label = 'Documento';
    const type = (file.type || '').toLowerCase();

    if (type === 'summary' || type === 'resumen') {
        Icon = BookOpen;
        label = 'Resumen';
    } else if (type === 'formulas' || type === 'formulario') {
        Icon = Calculator;
        label = 'Fórmulas';
    } else if (type === 'exam' || type === 'quiz' || type === 'examen') {
        Icon = FileQuestion;
        label = 'Examen';
    }

    const isRenaming = renamingId === menuId;
    const isMenuOpen = activeMenuId === menuId;
    const isGenerated = file.origin === 'AI' || ['summary', 'resumen', 'formulas', 'formulario', 'exam', 'quiz', 'examen'].includes(type);

    // Override startRenaming para usar menuId único en vez de file.id (evita que dos cards se renombren a la vez)
    const handleStartRenaming = () => {
        setRenamingId(menuId);
        setTempName(file.name);
        setActiveMenuId(null);
    };

    const handleViewClick = () => {
        const path = isGenerated ? 'resumen' : 'resource';
        navigate(`/home/subject/${subjectId}/topic/${topicId}/${path}/${file.id}`, {
            state: { file }
        });
    };

    // --- NUEVA FUNCIÓN PARA IR AL EDITOR ---
    const handleEditClick = (e) => {
        e.stopPropagation();
        setActiveMenuId(null); // Cerrar el menú
        navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${file.id}/edit`);
    };

    return (
        <div className="group relative h-64 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">

            {isGenerated && (
                <div className={`absolute inset-0 bg-gradient-to-br ${cardColor} opacity-90 transition-opacity group-hover:opacity-100`}></div>
            )}

            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {isGenerated ? (
                    <Icon className="w-32 h-32 text-white absolute -top-6 -left-6 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                ) : (
                    <FileText style={{ color: `var(--tw-color-${colorName}-500)` }} className="w-32 h-32 absolute -bottom-4 -right-4 rotate-12 opacity-[0.05]" />
                )}
            </div>

            <div className="absolute top-6 left-6 z-20">
                <div className={`p-2.5 rounded-xl border shadow-sm backdrop-blur-md ${
                    isGenerated
                        ? 'bg-white/20 border-white/20'
                        : `bg-${colorName}-50 dark:bg-${colorName}-950 border-${colorName}-100 dark:border-${colorName}-800`
                }`}>
                    {isGenerated
                        ? <Icon className="w-6 h-6 text-white" />
                        : <Icon className={`w-6 h-6 text-${colorName}-600 dark:text-${colorName}-400`} />
                    }
                </div>
            </div>

            {/* MENÚ ACTUALIZADO */}
            {/* *** CONDITIONAL: Only show menu if user can edit *** */}
            {permissions?.canEdit && (
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={(e) => handleMenuClick(e, menuId)} className={`p-1.5 rounded-full transition-colors ${isGenerated ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                        <MoreHorizontal className="w-6 h-6" />
                    </button>
                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-40 text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95">

                                {/* OPCIÓN: EDITAR CONTENIDO (Solo si es generado por IA) */}
                                {isGenerated && (
                                    <>
                                        <button
                                            onClick={handleEditClick}
                                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400"
                                        >
                                            <Pencil className="w-4 h-4" /> Editar Contenido
                                        </button>
                                        <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                    </>
                                )}

                                <button onClick={handleStartRenaming} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                    <FileEdit className={`w-4 h-4 text-${colorName}-600 dark:text-${colorName}-400`} /> Renombrar
                                </button>

                                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>

                                <button onClick={() => deleteFile(file)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="relative h-full p-8 flex flex-col justify-end z-10">
                <div className="mt-auto">
                    {isRenaming ? (
                        <div
                            className="mb-4 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 flex flex-col gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        saveRename(file);
                                    }
                                    if (e.key === 'Escape') {
                                        setRenamingId(null);
                                    }
                                }}
                                className="w-full bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm font-bold outline-none border border-transparent focus:border-indigo-500 transition-all"
                                autoFocus
                                placeholder="Escribe un nombre..."
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        saveRename(file);
                                    }}
                                    className="flex-1 bg-green-500 hover:bg-green-600 rounded-lg py-1 flex justify-center text-white transition-colors"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setRenamingId(null);
                                    }}
                                    className="flex-1 bg-red-500 hover:bg-red-600 rounded-lg py-1 flex justify-center text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>) : (
                        <h3 className={`text-2xl font-black leading-tight mb-6 uppercase tracking-tight line-clamp-2 ${isGenerated ? 'text-white' : 'text-slate-800 dark:text-slate-100'}`}>
                            {file.name || label}
                        </h3>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={handleViewClick}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                isGenerated
                                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white/10'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Maximize2 className="w-4 h-4" /> Ver
                        </button>

                        <a
                            href={file.url}
                            download={file.name}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                                isGenerated
                                    ? 'bg-white text-slate-900'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200'
                            }`}
                        >
                            <Download className="w-4 h-4" /> Bajar
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileCard;