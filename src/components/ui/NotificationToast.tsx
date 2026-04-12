// src/components/ui/NotificationToast.tsx
import React from 'react';
import { X } from 'lucide-react';

type NotificationToastTone = 'info' | 'success' | 'warning' | 'error';
type NotificationToastPosition = 'bottom-left' | 'bottom-center';

type NotificationToastProps = {
  show?: boolean;
  title?: string;
  message: string;
  icon?: React.ReactNode;
  tone?: NotificationToastTone | string;
  position?: NotificationToastPosition;
  offset?: number;
  onClose?: () => void;
  closeLabel?: string;
  actions?: React.ReactNode;
};

const TONE_CLASS_MAP: Record<string, string> = {
  info: 'border-sky-200/90 bg-white/95 text-slate-800 shadow-sky-900/10 dark:border-sky-800/70 dark:bg-slate-900/95 dark:text-slate-100',
  success:
    'border-emerald-200/90 bg-white/95 text-slate-800 shadow-emerald-900/10 dark:border-emerald-800/70 dark:bg-slate-900/95 dark:text-slate-100',
  warning:
    'border-amber-200/90 bg-white/95 text-slate-800 shadow-amber-900/10 dark:border-amber-800/70 dark:bg-slate-900/95 dark:text-slate-100',
  error:
    'border-rose-200/90 bg-white/95 text-slate-800 shadow-rose-900/10 dark:border-rose-800/70 dark:bg-slate-900/95 dark:text-slate-100',
};

const ICON_TONE_CLASS_MAP: Record<string, string> = {
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  error: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const NotificationToast = ({
  show = true,
  title,
  message,
  icon,
  tone = 'info',
  position = 'bottom-left',
  offset = 0,
  onClose,
  closeLabel = 'Cerrar notificación',
  actions,
}: NotificationToastProps) => {
  const normalizedTone = String(tone || 'info').toLowerCase();
  const toneClasses = TONE_CLASS_MAP[normalizedTone] || TONE_CLASS_MAP.info;
  const iconToneClasses = ICON_TONE_CLASS_MAP[normalizedTone] || ICON_TONE_CLASS_MAP.info;

  if (!show || !message) {
    return null;
  }

  const positionClass =
    position === 'bottom-center'
      ? 'left-1/2 -translate-x-1/2'
      : 'left-4 sm:left-6 lg:left-8';

  return (
    <div
      className={`fixed z-[110] w-[min(92vw,30rem)] animate-in slide-in-from-bottom-4 fade-in duration-300 ${positionClass}`}
      style={{ bottom: `${16 + Math.max(0, Number(offset) || 0)}px` }}
      role="status"
      aria-live="polite"
    >
      <div className={`rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${toneClasses}`}>
        <div className="flex items-start gap-3">
          {icon && (
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconToneClasses}`}>
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1">
            {title && <p className="text-sm font-bold tracking-tight">{title}</p>}
            <p className={`text-sm ${title ? 'mt-0.5' : ''}`}>{message}</p>
            {actions && <div className="mt-3 flex flex-wrap items-center gap-2">{actions}</div>}
          </div>

          {typeof onClose === 'function' && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-current/15 p-1.5 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200"
              aria-label={closeLabel}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
