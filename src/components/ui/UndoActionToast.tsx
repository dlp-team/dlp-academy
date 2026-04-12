// src/components/ui/UndoActionToast.tsx
import React from 'react';
import { RotateCcw } from 'lucide-react';
import NotificationToast from './NotificationToast';

type UndoActionToastProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
  tone?: 'warning' | 'success' | 'error' | string;
};

const TONE_CLASS_MAP: Record<string, string> = {
  error:
    'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  warning:
    'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  success:
    'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
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

  const normalizedTone = String(tone || 'warning').toLowerCase();
  const toneClasses = TONE_CLASS_MAP[normalizedTone] ? normalizedTone : 'warning';

  const actions = (
    <>
      {typeof onAction === 'function' && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-lg border border-current/40 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10"
        >
          {actionLabel}
        </button>
      )}
    </>
  );

  return (
    <NotificationToast
      show={Boolean(message)}
      title="Acción rápida"
      message={message}
      tone={toneClasses}
      icon={<RotateCcw className="h-4 w-4" />}
      actions={actions}
      position="bottom-left"
      offset={86}
      onClose={onClose}
      closeLabel="Cerrar notificacion"
    />
  );
};

export default UndoActionToast;
