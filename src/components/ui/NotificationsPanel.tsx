// src/components/ui/NotificationsPanel.tsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCheck, BellOff, FlaskConical, FolderSync, Loader2, X } from 'lucide-react';

const NotificationsPanel = ({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onResolveMoveRequest,
    isResolvingMoveRequest,
    triggerRef,
    onOpenAll,
    onClose
}: any) => {
    const navigate = useNavigate();
    const panelRef = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (e: any) => {
            const eventTarget = e?.target;
            const clickedInsidePanel = panelRef.current?.contains?.(eventTarget);
            const clickedInsideTrigger = triggerRef?.current?.contains?.(eventTarget);
            if (clickedInsidePanel || clickedInsideTrigger) return;
            onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, triggerRef]);

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }

        if (notification?.subjectId) {
            navigate(`/home/subject/${notification.subjectId}`);
            onClose();
        }
    };

    const isPendingShortcutMoveRequest = (notification: any) => {
        const type = String(notification?.type || '').trim().toLowerCase();
        const status = String(notification?.shortcutMoveRequestStatus || '').trim().toLowerCase();
        return type === 'shortcut_move_request' && status === 'pending' && Boolean(notification?.shortcutMoveRequestId);
    };

    const handleResolveMoveRequest = async (event: any, notification: any, resolution: any) => {
        event.stopPropagation();
        if (typeof onResolveMoveRequest !== 'function') return;
        await onResolveMoveRequest(notification, resolution);
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return 'ahora';
        if (diffMins < 60) return `hace ${diffMins}m`;
        if (diffHours < 24) return `hace ${diffHours}h`;
        return `hace ${diffDays}d`;
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div
            ref={panelRef}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 z-[10000] overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                <span className="font-semibold text-sm text-gray-800 dark:text-slate-200">
                    Notificaciones
                    {unreadCount > 0 && (
                        <span className="ml-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </span>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => onOpenAll?.()}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium transition-colors"
                    >
                        Ver todas
                    </button>
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
                        >
                            <CheckCheck size={13} />
                            Marcar todo
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                        <BellOff className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-slate-400">Sin notificaciones</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    handleNotificationClick(n);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors flex items-start gap-3 ${
                                !n.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                            }`}
                        >
                            {/* Icon */}
                            <div className="shrink-0 mt-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 p-1.5 rounded-lg">
                                {isPendingShortcutMoveRequest(n) ? (
                                    <FolderSync className="w-4 h-4 text-white" />
                                ) : (
                                    <FlaskConical className="w-4 h-4 text-white" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 leading-tight">
                                    {n.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                                    {n.message}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                    {formatTime(n.createdAt)}
                                </p>
                                {isPendingShortcutMoveRequest(n) && (
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={Boolean(isResolvingMoveRequest?.(n.shortcutMoveRequestId))}
                                            onClick={(event) => handleResolveMoveRequest(event, n, 'approved')}
                                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {isResolvingMoveRequest?.(n.shortcutMoveRequestId) ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Check className="h-3.5 w-3.5" />
                                            )}
                                            Aprobar
                                        </button>
                                        <button
                                            type="button"
                                            disabled={Boolean(isResolvingMoveRequest?.(n.shortcutMoveRequestId))}
                                            onClick={(event) => handleResolveMoveRequest(event, n, 'rejected')}
                                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {isResolvingMoveRequest?.(n.shortcutMoveRequestId) ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <X className="h-3.5 w-3.5" />
                                            )}
                                            Rechazar
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Unread dot */}
                            {!n.read && (
                                <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPanel;
