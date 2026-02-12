import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Download, AlertTriangle } from 'lucide-react';

const ViewResource = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const file = state?.file;

    // Si entran directamente por URL sin pasar por la tarjeta, no habrá archivo
    if (!file) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-white">
                <AlertTriangle className="w-12 h-12 text-yellow-500" />
                <p className="text-lg font-medium">No se encontró el archivo.</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="px-6 py-2 bg-indigo-600 rounded-full font-bold hover:bg-indigo-500 transition"
                >
                    Volver
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* --- HEADER DE NAVEGACIÓN --- */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 md:px-6 py-3 flex items-center justify-between shadow-lg z-10">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                        title="Volver"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-white font-bold text-base md:text-lg flex items-center gap-2 line-clamp-1">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            {file.name}
                        </h1>
                        <span className="text-xs text-slate-400">Vista previa</span>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <a 
                        href={file.url} 
                        download={file.name || 'documento.pdf'}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all shadow-md"
                    >
                        <Download className="w-4 h-4" /> 
                        <span className="hidden md:inline">Descargar</span>
                    </a>
                </div>
            </div>

            {/* --- VISOR PDF/ARCHIVO (IFRAME) --- */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden">
                <iframe 
                    src={file.url} 
                    className="w-full h-full absolute inset-0 border-0" 
                    title="Visor de Archivos"
                    allowFullScreen
                />
            </div>
        </div>
    );
};

export default ViewResource;