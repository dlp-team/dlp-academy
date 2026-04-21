// src/pages/ViewResource/ViewResource.tsx
import AnimatedPage from '../../components/layout/AnimatedPage';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, FileText, Download, AlertTriangle } from 'lucide-react';

const ViewResource = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const file = state?.file;
    const [viewerReloadToken, setViewerReloadToken] = useState(0);
    const [viewerReadyMap, setViewerReadyMap] = useState<any>({});
    const [viewerErrorMap, setViewerErrorMap] = useState<any>({});

    const viewerKey = `${file?.url || 'no-file'}-${viewerReloadToken}`;
    const viewerState = viewerErrorMap[viewerKey]
        ? 'error'
        : viewerReadyMap[viewerKey]
            ? 'ready'
            : 'loading';

    useEffect(() => {
        if (!file?.url || viewerState !== 'loading') return;

        const timeoutId = setTimeout(() => {
            setViewerErrorMap((prev: any) => ({ ...prev, [viewerKey]: true }));
            setViewerReadyMap((prev: any) => ({ ...prev, [viewerKey]: false }));
        }, 12000);

        return () => clearTimeout(timeoutId);
    }, [file?.url, viewerKey, viewerState]);

    const retryViewer = () => {
        setViewerReloadToken((prev) => prev + 1);
    };

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
                {viewerState === 'loading' && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-900/85 text-white">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <p className="text-sm font-semibold">Cargando vista previa...</p>
                        <p className="text-xs text-slate-300">Si tarda demasiado, puedes descargar el archivo.</p>
                    </div>
                )}

                {viewerState === 'error' && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/90 p-6">
                        <div className="w-full max-w-md rounded-2xl border border-rose-300/60 bg-white/95 p-5 text-slate-900 shadow-2xl">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
                                <div>
                                    <p className="text-sm font-black text-rose-700">No se pudo cargar la vista previa</p>
                                    <p className="mt-1 text-xs font-medium text-slate-600">
                                        El archivo puede estar bloqueado por el navegador o no ser compatible con el visor integrado.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    onClick={retryViewer}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                                >
                                    Reintentar visor
                                </button>
                                <a
                                    href={file.url}
                                    download={file.name || 'documento.pdf'}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                                >
                                    Descargar archivo
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                <iframe 
                    key={viewerKey}
                    src={file.url} 
                    className={`w-full h-full absolute inset-0 border-0 transition-opacity duration-300 ${viewerState === 'ready' ? 'opacity-100' : 'opacity-0'}`} 
                    title="Visor de Archivos"
                    allowFullScreen
                    onLoad={() => {
                        setViewerReadyMap((prev: any) => ({ ...prev, [viewerKey]: true }));
                        setViewerErrorMap((prev: any) => ({ ...prev, [viewerKey]: false }));
                    }}
                    onError={() => {
                        setViewerErrorMap((prev: any) => ({ ...prev, [viewerKey]: true }));
                        setViewerReadyMap((prev: any) => ({ ...prev, [viewerKey]: false }));
                    }}
                />
            </div>
        </div>
    );
};

export default ViewResource;