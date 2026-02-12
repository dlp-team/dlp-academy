import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FileText, MoreHorizontal, FileEdit, Trash2, 
    Check, X, Maximize2, Download, 
    BookOpen, Calculator, FileQuestion 
} from 'lucide-react';

const FileCard = ({ 
    file, 
    topic,
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
    getFileVisuals 
}) => {
    // Hooks de navegación
    const navigate = useNavigate();
    const { subjectId, topicId } = useParams();

    // --- 1. DETECCIÓN INTELIGENTE DEL TIPO ---
    let Icon = FileText;
    let label = 'Documento';

    // Normalizamos el tipo para evitar errores de mayúsculas
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
    } else if (getFileVisuals) {
        // Fallback: intentamos usar la función global si existe para otros tipos (pdf, img, etc)
        try {
            const visuals = getFileVisuals(file.type);
            if (visuals) {
                Icon = visuals.icon;
                label = visuals.label;
            }
        } catch (e) {}
    }

    const isRenaming = renamingId === file.id;
    const isMenuOpen = activeMenuId === file.id;
    const cardColor = topic?.color || 'from-blue-500 to-indigo-600';

    // DETERMINAR SI ES CONTENIDO GENERADO (Resumen/Fórmula/Examen)
    // Esto controla tanto el ESTILO como la NAVEGACIÓN
    const isGenerated = file.origin === 'AI' || ['summary', 'resumen', 'formulas', 'formulario', 'exam', 'quiz', 'examen'].includes(type);

    // --- 2. LÓGICA DE NAVEGACIÓN ---
    const handleViewClick = () => {
        if (isGenerated) {
            // Si es Resumen/Fórmula -> Va a la guía de estudio (StudyGuide)
            navigate(`/home/subject/${subjectId}/topic/${topicId}/resumen/${file.id}`, { 
                state: { file } 
            });
        } else {
            // Si es un archivo normal (PDF subido) -> Va al visor de recursos
            navigate(`/home/subject/${subjectId}/topic/${topicId}/resource/${file.id}`, { 
                state: { file } 
            });
        }
    };

    // --- 3. RENDERIZADO (DISEÑO PREMIUM ORIGINAL) ---
    return (
        <div className="group relative h-64 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default bg-white border border-slate-100">
            
            {/* FONDO DECORATIVO (Solo si es generado) */}
            {isGenerated && (
                <div className={`absolute inset-0 bg-gradient-to-br ${cardColor} opacity-90 transition-opacity group-hover:opacity-100`}></div>
            )}
            
            {/* ICONO DE FONDO GIGANTE */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {isGenerated ? (
                    <Icon className="w-32 h-32 text-white absolute -top-6 -left-6 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                ) : (
                    <FileText className="w-32 h-32 text-slate-100 absolute -bottom-4 -right-4 rotate-12" />
                )}
            </div>
            
            {/* ICONO PEQUEÑO ESQUINA */}
            <div className="absolute top-6 left-6 z-20">
                <div className={`p-2.5 rounded-xl border shadow-sm backdrop-blur-md ${isGenerated ? 'bg-white/20 border-white/20' : 'bg-indigo-50 border-indigo-100'}`}>
                    {isGenerated ? <Icon className="w-6 h-6 text-white" /> : <FileText className="w-6 h-6 text-indigo-600" />}
                </div>
            </div>

            {/* MENÚ DE ACCIONES */}
            <div className="absolute top-4 right-4 z-30">
                <button onClick={(e) => handleMenuClick(e, file.id)} className={`p-1.5 rounded-full transition-colors ${isGenerated ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>
                    <MoreHorizontal className="w-6 h-6" />
                </button>
                {isMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 text-slate-700 animate-in fade-in zoom-in-95">
                            <button onClick={() => startRenaming(file)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 flex items-center gap-2"><FileEdit className="w-4 h-4 text-indigo-600" /> Cambiar nombre</button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={() => deleteFile(file)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Eliminar</button>
                        </div>
                    </>
                )}
            </div>

            {/* CONTENIDO INFERIOR */}
            <div className="relative h-full p-8 flex flex-col justify-end text-white z-10">
                <div className="mt-auto">
                    {/* ETIQUETA FLOTANTE (Resumen/Fórmula) */}
                    {isGenerated && (
                        <span className="absolute top-6 right-16 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                            {label}
                        </span>
                    )}
                    
                    {/* NOMBRE O INPUT DE RENOMBRADO */}
                    {isRenaming ? (
                        <div className="mb-4 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 flex flex-col gap-2">
                            <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-white/90 text-slate-900 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none" autoFocus />
                            <div className="flex gap-2">
                                <button onClick={() => saveRename(file.id)} className="flex-1 bg-green-500 rounded-lg py-1 flex justify-center"><Check className="w-4 h-4" /></button>
                                <button onClick={() => setRenamingId(null)} className="flex-1 bg-red-500 rounded-lg py-1 flex justify-center"><X className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ) : (
                        <h3 className={`text-3xl font-extrabold leading-tight mb-6 uppercase tracking-tight line-clamp-2 ${isGenerated ? 'text-white' : 'text-slate-800'}`} title={file.name}>
                            {file.name || label}
                        </h3>
                    )}
                    
                    {/* BOTONES */}
                    <div className="flex gap-3">
                        <button 
                            onClick={handleViewClick} 
                            className={`flex-1 flex items-center justify-center gap-2 py-3 backdrop-blur-sm rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${isGenerated ? 'bg-white/20 hover:bg-white/30 text-white border border-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <Maximize2 className="w-4 h-4" /> Ver
                        </button>
                        
                        <a href={file.url} download={file.name} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${isGenerated ? 'bg-white text-indigo-900' : 'bg-slate-900 text-white'}`}><Download className="w-4 h-4" /> Bajar</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileCard;