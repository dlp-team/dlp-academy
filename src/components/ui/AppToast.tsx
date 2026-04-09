// src/components/ui/AppToast.tsx
import React, { useEffect } from 'react';
import {
    AlertCircle,
    Bell,
    BookOpen,
    CheckCircle2,
    FolderSync,
    Share2,
    TriangleAlert,
    Users,
    X,
} from 'lucide-react';
import {
    getNotificationVisualClasses,
    resolveNotificationVisualKind,
} from '../../utils/notificationVisualUtils';

const ICON_BY_VISUAL_KIND: Record<string, any> = {
    info: Bell,
    share: Share2,
    assignment: Users,
    shortcut: FolderSync,
    success: CheckCircle2,
    warning: TriangleAlert,
    error: AlertCircle,
};

const AppToast = ({
    show,
    title,
    message,
    type,
    variant,
    durationMs = 10000,
    onClose,
}: any) => {
    useEffect(() => {
        if (!show || typeof onClose !== 'function') return undefined;

        const timeoutDuration = Number.isFinite(durationMs)
            ? Math.max(0, Number(durationMs))
            : 10000;

        if (timeoutDuration === 0) return undefined;

        const timerId = window.setTimeout(() => {
            onClose();
        }, timeoutDuration);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [show, durationMs, message, title, type, variant, onClose]);

    if (!show) return null;

    const visualKind = resolveNotificationVisualKind({ type, variant });
    const visualClasses = getNotificationVisualClasses(visualKind);
    const IconComponent = ICON_BY_VISUAL_KIND[visualKind] || BookOpen;

    return (
        <div
            data-testid="app-toast"
            className="fixed bottom-5 left-5 z-[100] w-[min(92vw,420px)] animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
            <div
                className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${visualClasses.toastSurface} ${visualClasses.toastBorder}`}
            >
                <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-lg p-2 ${visualClasses.iconContainer}`}>
                        <IconComponent className={`h-4 w-4 ${visualClasses.iconColor}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {title || 'Notificacion'}
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-slate-600 dark:text-slate-300">
                            {message}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        aria-label="Cerrar notificacion"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppToast;