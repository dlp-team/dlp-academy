// src/components/ui/UndoActionToast.tsx
import React from 'react';

type UndoActionToastProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  tone?: 'warning' | 'success' | 'error' | string;
};

const TONE_CLASS_MAP: Record<string, string> = {
  error:
    'text-rose-700 dark:text-rose-300 bg-white/95 dark:bg-slate-900/95 border-rose-200 dark:border-rose-800/70',
  warning:
    'text-slate-700 dark:text-slate-200 bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700',
  success:
    'text-emerald-700 dark:text-emerald-300 bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-800/70',
};

const UndoActionToast = ({
  message,
  actionLabel = 'Deshacer',
  onAction,
  onClose,
  tone = 'warning',
}: UndoActionToastProps) => {
  if (!message) {
    return null;
  }

  const toneClasses = TONE_CLASS_MAP[tone] || TONE_CLASS_MAP.warning;

  return (
    <div className="fixed bottom-5 left-5 z-[80] w-[min(92vw,460px)]">
      <div className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${toneClasses}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium leading-snug">{message}</p>
          <div className="flex items-center gap-2">
            {typeof onAction === 'function' && (
              <button
                type="button"
                onClick={onAction}
                className="rounded-lg border border-current/35 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {actionLabel}
              </button>
            )}
            {typeof onClose === 'function' && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-current/25 px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
};

export default UndoActionToast;
