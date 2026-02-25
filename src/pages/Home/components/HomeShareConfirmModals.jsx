// src/pages/Home/components/HomeShareConfirmModals.jsx
import React from 'react';

const HomeShareConfirmModals = ({ shareConfirm, setShareConfirm, unshareConfirm, setUnshareConfirm, subjects }) => {
    const closeUnshareConfirm = () => {
        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null, onPreserveConfirm: null });
    };

    return (
        <>
            {shareConfirm.open && (
                <div className="fixed inset-0 z-51 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" />
                            </svg>
                        </div>
                        {(() => {
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
                        <div className="flex justify-center gap-4">
                            <button
                                className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={() => setShareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null })}
                            >
                                Cancelar
                            </button>
                            <button
                                className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                onClick={shareConfirm.onConfirm}
                            >
                                Sí, compartir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {unshareConfirm.open && (
                <div className="fixed inset-0 z-51 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-colors">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl p-6 text-center animate-in fade-in zoom-in duration-200 transition-colors">
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
                        <div className="flex justify-center gap-4">
                            <button
                                className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                onClick={closeUnshareConfirm}
                            >
                                Cancelar
                            </button>
                            {typeof unshareConfirm.onPreserveConfirm === 'function' && (
                                <button
                                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                    onClick={unshareConfirm.onPreserveConfirm}
                                >
                                    Mover sin descompartir
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
            )}
        </>
    );
};

export default HomeShareConfirmModals;
