// src/pages/Home/components/HomeShareConfirmModals.jsx
import React from 'react';
import { OVERLAY_TOP_OFFSET_STYLE } from '../../../utils/layoutConstants';
import { HOME_THEME_TOKENS } from '../../../utils/themeTokens';

const HomeShareConfirmModals = ({
    homeThemeTokens = HOME_THEME_TOKENS,
    shareConfirm,
    setShareConfirm,
    unshareConfirm,
    setUnshareConfirm,
    subjects
}) => {
    const getSelectionPreviewCount = (selectionPreview: any) => {
        const totalCount = Number(selectionPreview?.totalCount || 0);
        if (!Number.isFinite(totalCount) || totalCount <= 1) {
            return 0;
        }
        return totalCount;
    };

    const renderSelectionPreview = (selectionPreview: any) => {
        const totalCount = Number(selectionPreview?.totalCount || 0);
        if (!Number.isFinite(totalCount) || totalCount <= 1) {
            return null;
        }

        const visibleNames = Array.isArray(selectionPreview?.visibleNames)
            ? selectionPreview.visibleNames.filter(Boolean).map((name: any) => String(name)).slice(0, 5)
            : [];
        const hiddenCount = Number.isFinite(Number(selectionPreview?.hiddenCount))
            ? Math.max(0, Number(selectionPreview.hiddenCount))
            : Math.max(0, totalCount - visibleNames.length);

        return (
            <div className="mb-6 rounded-xl border border-indigo-100 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-900/20 p-3 text-left">
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    Esta accion se aplicara a {totalCount} elemento(s) seleccionado(s):
                </p>
                {visibleNames.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-indigo-800 dark:text-indigo-200 list-disc list-inside">
                        {visibleNames.map((name: any, index: number) => (
                            <li key={`selection-preview-${index}`}>{name}</li>
                        ))}
                        {hiddenCount > 0 && (
                            <li>{`...y ${hiddenCount} mas.`}</li>
                        )}
                    </ul>
                )}
            </div>
        );
    };

    const closeShareConfirm = () => {
        if (typeof shareConfirm?.onCancel === 'function') {
            shareConfirm.onCancel();
        }
        setShareConfirm({ open: false, type: null, subjectId: null, folder: null, onConfirm: null, onMergeConfirm: null, selectionPreview: null });
    };

    const closeUnshareConfirm = () => {
        if (typeof unshareConfirm?.onCancel === 'function') {
            unshareConfirm.onCancel();
        }
        setUnshareConfirm({ open: false, subjectId: null, folder: null, onConfirm: null, onPreserveConfirm: null, selectionPreview: null });
    };

    return (
        <>
            {shareConfirm.open && (
                <div className="fixed inset-0 z-51" onClick={closeShareConfirm}>
                    <div className={homeThemeTokens.modalBackdropClass} />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4" style={OVERLAY_TOP_OFFSET_STYLE}>
                    <div className={homeThemeTokens.modalCardClass} onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" />
                            </svg>
                        </div>
                        {shareConfirm.type === 'shared-mismatch-move' ? (
                            <>
                                {getSelectionPreviewCount(shareConfirm?.selectionPreview) > 1 ? (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            Usuarios compartidos diferentes detectados en la seleccion
                                        </h3>
                                        <p className={`${homeThemeTokens.mutedTextClass} mb-6`}>
                                            Al mover {getSelectionPreviewCount(shareConfirm?.selectionPreview)} elemento(s) seleccionado(s) dentro de la carpeta compartida{' '}
                                            <span className="font-semibold">"{shareConfirm.folder?.name || 'carpeta compartida'}"</span>, los usuarios compartidos no coinciden.
                                            <br />Elige como deseas continuar.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Usuarios compartidos diferentes detectados
                                </h3>
                                <p className={`${homeThemeTokens.mutedTextClass} mb-6`}>
                                    Al mover <span className="font-semibold">"{shareConfirm.sourceName || (shareConfirm.sourceType === 'folder' ? 'esta carpeta' : 'esta asignatura')}"</span> dentro de la carpeta compartida{' '}
                                    <span className="font-semibold">"{shareConfirm.folder?.name || 'carpeta compartida'}"</span>, los usuarios compartidos no coinciden.
                                    <br />Elige cómo deseas continuar.
                                </p>
                                    </>
                                )}
                            </>
                        ) : shareConfirm.type === 'shortcut-move-request' ? (
                            <>
                                {getSelectionPreviewCount(shareConfirm?.selectionPreview) > 1 ? (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            No se pueden mover accesos directos a una carpeta compartida
                                        </h3>
                                        <p className={`${homeThemeTokens.mutedTextClass} mb-6`}>
                                            Algunos accesos directos de tu seleccion no pueden vivir dentro de carpetas compartidas. Solo el propietario puede mover los elementos originales a{' '}
                                            <span className="font-semibold">"{shareConfirm.folder?.name || 'carpeta compartida'}"</span>.
                                            <br />¿Quieres solicitar este movimiento al propietario?
                                        </p>
                                    </>
                                ) : (
                                    <>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    No se puede mover un acceso directo a una carpeta compartida
                                </h3>
                                <p className={`${homeThemeTokens.mutedTextClass} mb-6`}>
                                    Los accesos directos no pueden vivir dentro de carpetas compartidas. Solo el propietario puede mover el elemento original a{' '}
                                    <span className="font-semibold">"{shareConfirm.folder?.name || 'carpeta compartida'}"</span>.
                                    <br />¿Quieres solicitar este movimiento al propietario?
                                </p>
                                    </>
                                )}
                            </>
                        ) : (() => {
                            const selectionCount = getSelectionPreviewCount(shareConfirm?.selectionPreview);
                            if (selectionCount > 1) {
                                const folderName = shareConfirm.folder?.name || '';
                                return (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            Vas a mover {selectionCount} elemento(s) seleccionado(s) a una carpeta compartida
                                        </h3>
                                        <p className={`${homeThemeTokens.mutedTextClass} mb-6`}>
                                            Esta accion puede ajustar el estado de comparticion de los elementos movidos segun los permisos de la carpeta{' '}
                                            <span className="font-semibold">"{folderName}"</span>.
                                            <br />¿Deseas continuar?
                                        </p>
                                    </>
                                );
                            }

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
                                    <p className={`${homeThemeTokens.mutedTextClass} mb-6`}>
                                        Esto hará que la {itemType} también sea compartida automáticamente con las mismas personas que tienen acceso a la carpeta{' '}
                                        <span className="font-semibold">"{folderName}"</span>.
                                        <br />¿Deseas continuar?
                                    </p>
                                </>
                            );
                        })()}
                        {renderSelectionPreview(shareConfirm?.selectionPreview)}
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
                    <div className={homeThemeTokens.modalBackdropClass} />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4" style={OVERLAY_TOP_OFFSET_STYLE}>
                    <div className={homeThemeTokens.modalCardClass} onClick={(e) => e.stopPropagation()}>
                        <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5C7.305 20.5 3.5 16.695 3.5 12S7.305 3.5 12 3.5 20.5 7.305 20.5 12 16.695 20.5 12 20.5z" />
                            </svg>
                        </div>
                        {(() => {
                            const selectionCount = getSelectionPreviewCount(unshareConfirm?.selectionPreview);
                            if (selectionCount > 1) {
                                const folderName = unshareConfirm.folder?.name || '';
                                return (
                                    <>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            Vas a mover {selectionCount} elemento(s) seleccionado(s) fuera de una carpeta compartida
                                        </h3>
                                        <p className={`${homeThemeTokens.mutedTextClass} mb-6`}>
                                            Esta accion puede quitar el acceso heredado desde la carpeta compartida{' '}
                                            <span className="font-semibold">"{folderName}"</span>.
                                            <br />¿Deseas continuar?
                                        </p>
                                    </>
                                );
                            }

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
                                    <p className={`${homeThemeTokens.mutedTextClass} mb-6`}>
                                        Esto hará que la {itemType} deje de estar compartida automáticamente con las personas que tenían acceso a la carpeta{' '}
                                        <span className="font-semibold">"{folderName}"</span>.
                                        <br />¿Deseas continuar?
                                    </p>
                                </>
                            );
                        })()}
                        {renderSelectionPreview(unshareConfirm?.selectionPreview)}
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
