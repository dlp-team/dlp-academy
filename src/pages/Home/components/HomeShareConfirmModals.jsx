// src/pages/Home/components/HomeShareConfirmModals.jsx
import React from 'react';
import { OVERLAY_TOP_OFFSET_STYLE } from '../../../utils/layoutConstants';

const HomeShareConfirmModals = ({ shareConfirm, setShareConfirm, unshareConfirm, setUnshareConfirm, subjects }) => {
    const closeShareConfirm = () => setShareConfirm({ open: false, type: null, subjectId: null, folder: null, onConfirm: null, onMergeConfirm: null });
    const closeUnshareConfirm = () => setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null, onPreserveConfirm: null });

    return (
        <>
            {shareConfirm.open && (
                <div className="fixed inset-0 z-51" onClick={closeShareConfirm}>
                    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-colors" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4" style={OVERLAY_TOP_OFFSET_STYLE}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[calc(100vh-10rem)] overflow-y-auto shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" />
                            </svg>
                        </div>
                        {shareConfirm.type === 'shared-mismatch-move' ? (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Usuarios compartidos diferentes detectados
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Al mover <span className="font-semibold">"{shareConfirm.sourceName || (shareConfirm.sourceType === 'folder' ? 'esta carpeta' : 'esta asignatura')}"</span> dentro de la carpeta compartida{' '}
                                    <span className="font-semibold">"{shareConfirm.folder?.name || 'carpeta compartida'}"</span>, los usuarios compartidos no coinciden.
                                    <br />Elige cómo deseas continuar.
                                </p>
                            </>
                        ) : shareConfirm.type === 'shortcut-move-request' ? (
                            <>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    No se puede mover un acceso directo a una carpeta compartida
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Los accesos directos no pueden vivir dentro de carpetas compartidas. Solo el propietario puede mover el elemento original a{' '}
                                    <span className="font-semibold">"{shareConfirm.folder?.name || 'carpeta compartida'}"</span>.
                                    <br />¿Quieres solicitar este movimiento al propietario?
                                </p>
                            </>
                        ) : (() => {
                            const isFolder = !shareConfirm.subjectId;
                            const itemType = isFolder ? 'carpeta' : 'asignatura';
                            const itemName = isFolder
                                ? shareConfirm.folder?.name || ''
                                : (() => {
                                      if (shareConfirm.subjectId && subjects) {
                                          const subj = subjects.find(s => s.id === shareConfirm.subjectId);
                                          return subj ? subj.name : '';
                                      }
                                      return '';
                                  })();
                            const folderName = shareConfirm.folder?.name || '';
                            return (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Vas a mover la {itemType} <span className="font-semibold">"{itemName}"</span> a una carpeta compartida
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Esto hará que la {itemType} también sea compartida automáticamente con las mismas personas que tienen acceso a la carpeta{' '}
                                        <span className="font-semibold">"{folderName}"</span>.
                                        <br />¿Deseas continuar?
                                    </p>
                                </>
                            );
                        })()}
                        <div className="flex justify-center gap-3 flex-wrap">
                            <button
                                className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={closeShareConfirm}
                            >
                                Cancelar
                            </button>
                            {shareConfirm.type === 'shared-mismatch-move' && typeof shareConfirm.onConfirm === 'function' && (
                                <button
                                    className="px-6 py-2 rounded-xl bg-yellow-600 text-white font-bold shadow-lg hover:bg-yellow-700 transition-colors"
                                    onClick={shareConfirm.onConfirm}
                                >
                                    Mover y ajustar a carpeta destino
                                </button>
                            )}
                            {shareConfirm.type === 'shared-mismatch-move' && typeof shareConfirm.onMergeConfirm === 'function' && (
                                <button
                                    className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                    onClick={shareConfirm.onMergeConfirm}
                                >
                                    Mover y fusionar usuarios
                                </button>
                            )}
                            {shareConfirm.type !== 'shared-mismatch-move' && (
                            <button
                                className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                onClick={shareConfirm.onConfirm}
                            >
                                {shareConfirm.type === 'shortcut-move-request' ? 'Solicitar al propietario' : 'Sí, compartir'}
                            </button>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
            )}

            {unshareConfirm.open && (
                <div className="fixed inset-0 z-51" onClick={closeUnshareConfirm}>
                    <div className="absolute inset-0 bg-black/50 dark:bg-black/70 transition-colors" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4" style={OVERLAY_TOP_OFFSET_STYLE}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[calc(100vh-10rem)] overflow-y-auto shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" />
                            </svg>
                        </div>
                        {(() => {
                            const isFolder = !unshareConfirm.subjectId;
                            const itemType = isFolder ? 'carpeta' : 'asignatura';
                            const itemName = isFolder
                                ? unshareConfirm.folder?.name || ''
                                : (() => {
                                      if (unshareConfirm.subjectId && subjects) {
                                          const subj = subjects.find(s => s.id === unshareConfirm.subjectId);
                                          return subj ? subj.name : '';
                                      }
                                      return '';
                                  })();
                            const folderName = unshareConfirm.folder?.name || '';
                            return (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Vas a mover la {itemType} <span className="font-semibold">"{itemName}"</span> fuera de una carpeta compartida
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        Esto hará que la {itemType} deje de estar compartida automáticamente con las personas que tenían acceso a la carpeta{' '}
                                        <span className="font-semibold">"{folderName}"</span>.
                                        <br />¿Deseas continuar?
                                    </p>
                                </>
                            );
                        })()}
                        <div className="flex justify-center gap-3 flex-wrap">
                            <button
                                className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={closeUnshareConfirm}
                            >
                                Cancelar
                            </button>
                            {typeof unshareConfirm.onPreserveConfirm === 'function' && (
                                <button
                                    className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                    onClick={unshareConfirm.onPreserveConfirm}
                                >
                                    Mover sin dejar de compartir
                                </button>
                            )}
                            <button
                                className="px-6 py-2 rounded-xl bg-yellow-600 text-white font-bold shadow-lg hover:bg-yellow-700 transition-colors"
                                onClick={unshareConfirm.onConfirm}
                            >
                                Sí, dejar de compartir
                            </button>
                        </div>
                    </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HomeShareConfirmModals;
