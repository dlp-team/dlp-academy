// src/pages/Home/components/bin/BinConfirmModals.jsx
import React from 'react';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

// ─── Delete single subject ─────────────────────────────────────────────────────
export const DeleteConfirmModal = ({ subjectId, actionLoading, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
                <h3 className="text-xl font-bold">Eliminar permanentemente</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Estas seguro de que quieres eliminar permanentemente esta asignatura?
            </p>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
                    Esta accion no se puede deshacer y eliminara:
                </p>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1 ml-4">
                    <li>- La asignatura</li>
                    <li>- Todos sus temas</li>
                    <li>- Todos los documentos</li>
                    <li>- Todos los archivos asociados</li>
                </ul>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => onConfirm(subjectId)}
                    disabled={actionLoading === subjectId}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
                >
                    {actionLoading === subjectId
                        ? <Loader2 className="animate-spin" size={16} />
                        : <Trash2 size={16} />
                    }
                    Eliminar permanentemente
                </button>
            </div>
        </div>
    </div>
);

// ─── Empty entire bin ──────────────────────────────────────────────────────────
export const EmptyBinConfirmModal = ({ count, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
                <h3 className="text-xl font-bold">Vaciar papelera</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
                Seguro que deseas eliminar permanentemente los {count} elementos de la papelera?
            </p>

            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                >
                    <Trash2 size={16} />
                    Vaciar papelera
                </button>
            </div>
        </div>
    </div>
);