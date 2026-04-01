// src/pages/AdminDashboard/components/AdminConfirmModal.tsx
import React from 'react';

type AdminConfirmModalProps = {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    isConfirming?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

const AdminConfirmModal = ({
    isOpen,
    title,
    description,
    confirmLabel = 'Confirmar',
    isConfirming = false,
    onCancel,
    onConfirm
}: AdminConfirmModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/55" onClick={onCancel} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6"
            >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isConfirming}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isConfirming}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {isConfirming ? 'Procesando...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminConfirmModal;
