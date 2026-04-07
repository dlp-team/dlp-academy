// src/pages/Home/components/HomeBulkActionFeedback.tsx
import React from 'react';

type HomeBulkActionFeedbackProps = {
    message: string;
    tone?: 'success' | 'warning' | 'error' | string;
    floating?: boolean;
    actionLabel?: string;
    onAction?: () => void;
    onClose?: () => void;
};

const TONE_CLASS_MAP: Record<string, string> = {
    error:
        'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning:
        'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    success:
        'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
};

const HomeBulkActionFeedback = ({
    message,
    tone = 'success',
    floating = false,
    actionLabel = '',
    onAction,
    onClose,
}: HomeBulkActionFeedbackProps) => {
    if (!message) {
        return null;
    }

    const toneClasses = TONE_CLASS_MAP[tone] || TONE_CLASS_MAP.success;

    if (floating) {
        return (
            <div className="fixed bottom-6 left-1/2 z-[80] w-[min(92vw,640px)] -translate-x-1/2">
                <div className={`rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm ${toneClasses}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium">{message}</p>
                        <div className="flex items-center gap-2">
                            {typeof onAction === 'function' && (
                                <button
                                    type="button"
                                    onClick={onAction}
                                    className="rounded-lg border border-current/40 px-3 py-1.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    {actionLabel || 'Deshacer'}
                                </button>
                            )}
                            {typeof onClose === 'function' && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg border border-current/30 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                    aria-label="Cerrar notificacion"
                                >
                                    Cerrar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <p className={`mt-3 rounded-lg border px-3 py-2 text-sm ${toneClasses}`}>
            {message}
        </p>
    );
};

export default HomeBulkActionFeedback;
