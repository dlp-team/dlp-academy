// src/pages/Topic/components/TopicConfirmDeleteModal.jsx
import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

const TopicConfirmDeleteModal = ({
    confirmDialog,
    isConfirmingAction = false,
    onClose,
    onConfirm
}) => {
    if (!confirmDialog?.isOpen) return null;

    const title = confirmDialog.title || 'Confirmar eliminación';
    const description = confirmDialog.description
        || `Se eliminará "${confirmDialog.itemName || 'el elemento seleccionado'}". Esta acción no se puede deshacer.`;
    const confirmLabel = confirmDialog.confirmLabel || 'Eliminar';

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/30 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-red-900 dark:text-red-300">{title}</h3>
                            <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">Revisión requerida antes de continuar.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isConfirmingAction}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-60"
                        aria-label="Cerrar confirmación"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-5 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isConfirmingAction}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isConfirmingAction}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200/60 dark:shadow-none disabled:opacity-70 inline-flex items-center justify-center gap-2"
                    >
                        {isConfirmingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isConfirmingAction ? 'Eliminando...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopicConfirmDeleteModal;